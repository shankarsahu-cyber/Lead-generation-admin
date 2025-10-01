import { FormData, FormField } from '@/types/form-builder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormPreview } from './FormPreview';
import { FormSummary } from './FormSummary';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PreviewStepIndicator } from './PreviewStepIndicator';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  onSaveForm: () => void; // New prop for saving form as template
}

// Helper to recursively get a nested field by its path
const getNestedField = (fields: FormField[], path: string[]): FormField | null => {
  if (path.length === 0) return null;
  
  const field = fields.find(f => f.fieldId === path[0]);
  if (!field) return null;
  
  if (path.length === 1) return field;
  
  return getNestedField(field.subFields, path.slice(1));
};

// Helper to recursively get a nested field's label by its path
const getNestedFieldLabel = (fields: FormField[], targetPath: string[]): string => {
  if (targetPath.length === 0) return '';
  const field = fields.find(f => f.fieldId === targetPath[0]);
  if (!field) return '';
  if (targetPath.length === 1) return field.label;
  return getNestedFieldLabel(field.subFields, targetPath.slice(1));
};

export const PreviewModal = ({ isOpen, onClose, formData, onSaveForm }: PreviewModalProps) => {
  const [currentPreviewStepId, setCurrentPreviewStepId] = useState<string>('');
  const [currentPreviewFieldPath, setCurrentPreviewFieldPath] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({}); // State for preview form values
  // const [showSummary, setShowSummary] = useState<boolean>(false); // State for summary view

  useEffect(() => {
    if (isOpen && formData.steps.length > 0) {
      setCurrentPreviewStepId(formData.steps[0].stepId);
      setCurrentPreviewFieldPath([]);
      setFormValues({}); // Clear form values on modal open
      // setShowSummary(false); // Reset summary view
    } else if (!isOpen) {
      setCurrentPreviewStepId('');
      setCurrentPreviewFieldPath([]);
      setFormValues({});
      // setShowSummary(false);
    }
  }, [isOpen, formData]);

  const getCurrentPreviewStepIndex = () => {
    return formData.steps.findIndex(step => step.stepId === currentPreviewStepId);
  };

  const currentStep = formData.steps.find(s => s.stepId === currentPreviewStepId);

  const handleNextStep = () => {
    if (!currentStep) return; // Should not happen

    if (currentPreviewFieldPath.length > 0) {
      // Currently in a subfield, try to move to the next subfield
      const parentFieldPath = currentPreviewFieldPath.slice(0, -1);
      const currentParentField = getNestedField(currentStep.fields, parentFieldPath);

      if (currentParentField && currentParentField.subFields) {
        const currentSubFieldId = currentPreviewFieldPath[currentPreviewFieldPath.length - 1];
        const currentSubFieldIndex = currentParentField.subFields.findIndex(f => f.fieldId === currentSubFieldId);

        if (currentSubFieldIndex < currentParentField.subFields.length - 1) {
          // Move to next subfield
          setCurrentPreviewFieldPath([
            ...parentFieldPath,
            currentParentField.subFields[currentSubFieldIndex + 1].fieldId,
          ]);
          return;
        }
      }
    }

    // If not in a subfield, or at the end of subfields, move to next main step
    const currentIndex = getCurrentPreviewStepIndex();
    if (currentIndex < formData.steps.length - 1) {
      setCurrentPreviewStepId(formData.steps[currentIndex + 1].stepId);
      setCurrentPreviewFieldPath([]); // Reset field path when changing step
    } else {
      // If it's the last step, close the modal
      onClose();
    }
  };

  const handlePreviousStep = () => {
    if (!currentStep) return; // Should not happen

    if (currentPreviewFieldPath.length > 0) {
      // Currently in a subfield, try to move to the previous subfield
      const parentFieldPath = currentPreviewFieldPath.slice(0, -1);
      const currentParentField = getNestedField(currentStep.fields, parentFieldPath);

      if (currentParentField && currentParentField.subFields) {
        const currentSubFieldId = currentPreviewFieldPath[currentPreviewFieldPath.length - 1];
        const currentSubFieldIndex = currentParentField.subFields.findIndex(f => f.fieldId === currentSubFieldId);

        if (currentSubFieldIndex > 0) {
          // Move to previous subfield
          setCurrentPreviewFieldPath([
            ...parentFieldPath,
            currentParentField.subFields[currentSubFieldIndex - 1].fieldId,
          ]);
          return;
        }
      }
    }

    // If not in a subfield, or at the beginning of subfields, move to previous main step
    const currentIndex = getCurrentPreviewStepIndex();
    if (currentIndex > 0) {
      setCurrentPreviewStepId(formData.steps[currentIndex - 1].stepId);
      setCurrentPreviewFieldPath([]); // Reset field path when changing step
    }
  };

  const currentStepIndex = getCurrentPreviewStepIndex();
  const isFirstStep = currentStepIndex === 0 && currentPreviewFieldPath.length === 0;
  const isLastStep = currentStepIndex === formData.steps.length - 1 && currentPreviewFieldPath.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Preview</DialogTitle>
        </DialogHeader>
        
        {currentPreviewFieldPath.length === 0 && (
          <PreviewStepIndicator 
            formData={formData} 
            currentStepId={currentPreviewStepId}
            onStepClick={(stepId) => setCurrentPreviewStepId(stepId)}
          />
        )}

        {/* Field/Subfield Breadcrumb and Back Button */}
        {currentPreviewFieldPath.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span 
                className="cursor-pointer hover:text-primary"
                onClick={() => setCurrentPreviewFieldPath([])}
              >
                {formData.steps.find(s => s.stepId === currentPreviewStepId)?.title || ''}
              </span>
            {currentPreviewFieldPath.map((fieldId, index) => {
              const path = currentPreviewFieldPath.slice(0, index + 1);
              const stepFields = formData.steps.find(s => s.stepId === currentPreviewStepId)?.fields || [];
              const fieldLabel = getNestedFieldLabel(stepFields, path);
              if (!fieldLabel) return null;
              return (
                <React.Fragment key={fieldId}>
                  <span>/</span>
                  <span 
                    className={`cursor-pointer ${index === currentPreviewFieldPath.length - 1 ? 'text-primary font-semibold' : 'hover:text-primary'}`}
                    onClick={() => setCurrentPreviewFieldPath(path)}
                  >
                    {fieldLabel}
                  </span>
                </React.Fragment>
              );
            })}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (currentPreviewFieldPath.length > 1) {
                  setCurrentPreviewFieldPath(prev => prev.slice(0, -1));
                } else {
                  setCurrentPreviewFieldPath([]);
                }
              }}
            >
              ← Back
            </Button>
          </div>
        )}
        
        <div className="mt-4">
          <FormPreview 
              formData={formData} 
              currentStepId={currentPreviewStepId}
              currentFieldPath={currentPreviewFieldPath}
              onFieldCardClick={(fieldId) => setCurrentPreviewFieldPath(prev => [...prev, fieldId])}
              formValues={formValues}
              onFormValuesChange={setFormValues}
            />
        </div>
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={isFirstStep}
          >
            Previous Step
          </Button>
            <Button
              onClick={isLastStep ? onSaveForm : handleNextStep} // Call onSaveForm on last step, otherwise handleNextStep
              disabled={isLastStep && currentPreviewFieldPath.length === 0}
              className="bg-gradient-to-r from-builder-primary to-builder-secondary"
            >
              {isLastStep ? "Save Form" : "Next Step"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};