import { useState } from 'react';
import { FormData, FormStep, FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, ChevronRight, FileText } from 'lucide-react';

interface FormPreviewProps {
  formData: FormData;
  currentStepId: string;
  currentFieldPath: string[];
  onFieldCardClick: (fieldId: string) => void;
  formValues: Record<string, any>;
  onFormValuesChange: (values: Record<string, any>) => void;
}

export const FormPreview = ({
  formData,
  currentStepId,
  currentFieldPath,
  onFieldCardClick,
  formValues,
  onFormValuesChange
}: FormPreviewProps) => {
  const getNestedField = (fields: FormField[], path: string[]): FormField | null => {
    if (path.length === 0) return null;
    const field = fields.find(f => f.fieldId === path[0]);
    if (!field) return null;
    if (path.length === 1) return field;
    return getNestedField(field.subFields, path.slice(1));
  };

  const currentStep = formData.steps.find(s => s.stepId === currentStepId);
  let fieldsToDisplay: FormField[] = [];

  if (currentStep) {
    if (currentFieldPath.length === 0) {
      fieldsToDisplay = currentStep.fields;
    } else {
      const parentField = getNestedField(currentStep.fields, currentFieldPath);
      fieldsToDisplay = parentField?.subFields || [];
    }
  }

  // Always show fields as clickable cards for better navigation
  // This ensures all fields remain clickable at every level
  const isLeafLevel = false;
  
  // Handle click on field cards - navigate deeper if field has subFields
  const handleFieldCardClick = (field: FormField) => {
    // Navigate deeper for fields with subFields
    if (field.subFields && field.subFields.length > 0) {
      onFieldCardClick(field.fieldId);
    } else {
      // For leaf fields, we could show a modal or expand inline form
      // For now, we'll just provide visual feedback that it's a form field
      console.log(`Clicked on form field: ${field.label}`);
    }
  };

  const renderFieldInput = (field: FormField, parentKey = ''): React.ReactNode => {
    const fieldKey = parentKey ? `${parentKey}.${field.fieldId}` : field.fieldId;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.fieldId} className="space-y-2">
            <Label htmlFor={fieldKey}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldKey}
              type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={formValues[fieldKey] || ''}
              onChange={(e) => onFormValuesChange({ ...formValues, [fieldKey]: e.target.value })}
            />
          </div>
        );

      case 'text_area':
        return (
          <div key={field.fieldId} className="space-y-2">
            <Label htmlFor={fieldKey}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldKey}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={formValues[fieldKey] || ''}
              onChange={(e) => onFormValuesChange({ ...formValues, [fieldKey]: e.target.value })}
            />
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.fieldId} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={formValues[fieldKey] || ''}
              onValueChange={(value) => onFormValuesChange({ ...formValues, [fieldKey]: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.optionId} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.fieldId} className="space-y-3">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formValues[fieldKey] || ''}
              onValueChange={(value) => onFormValuesChange({ ...formValues, [fieldKey]: value })}
            >
              {field.options?.map((option) => (
                <div key={option.optionId} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${fieldKey}-${option.optionId}`} />
                  <Label htmlFor={`${fieldKey}-${option.optionId}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkboxes':
        return (
          <div key={field.fieldId} className="space-y-3">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.optionId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${fieldKey}-${option.optionId}`}
                    checked={(formValues[fieldKey] || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = formValues[fieldKey] || [];
                      if (checked) {
                        onFormValuesChange({
                          ...formValues,
                          [fieldKey]: [...currentValues, option.value]
                        });
                      } else {
                        onFormValuesChange({
                          ...formValues,
                          [fieldKey]: currentValues.filter((v: string) => v !== option.value)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`${fieldKey}-${option.optionId}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'file_upload':
      case 'image_upload':
        const uploadedFile = formValues[fieldKey];
        const imagePreviewUrl = uploadedFile instanceof File ? URL.createObjectURL(uploadedFile) : null;
        
        return (
          <div key={field.fieldId} className="space-y-2">
            <Label htmlFor={fieldKey}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldKey}
              type="file"
              accept={field.type === 'image_upload' ? 'image/*' : undefined}
              onChange={(e) => {
                const file = e.target.files?.[0];
                onFormValuesChange({ ...formValues, [fieldKey]: file });
              }}
            />
            {/* Image Preview */}
            {field.type === 'image_upload' && imagePreviewUrl && (
              <div className="mt-3">
                <div className="relative inline-block">
                  <img 
                    src={imagePreviewUrl} 
                    alt={`Preview of ${field.label}`}
                    className="max-w-xs max-h-48 object-contain border rounded-lg shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => {
                      onFormValuesChange({ ...formValues, [fieldKey]: null });
                      // Clear the file input
                      const fileInput = document.getElementById(fieldKey) as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    ×
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Separate image upload fields from other fields
  const imageUploadFields = fieldsToDisplay.filter(field => field.type === 'image_upload');
  const otherFields = fieldsToDisplay.filter(field => field.type !== 'image_upload');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {isLeafLevel ? (
        <div className="space-y-6">
          {fieldsToDisplay.map(field => renderFieldInput(field))}
        </div>
      ) : (
        <>
          {/* Non-image fields in vertical form layout */}
          {otherFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Form Fields</h3>
              <div className="space-y-4">
                {otherFields.map(field => (
                  <Card 
                    key={field.fieldId} 
                    className="w-full cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 border-dashed"
                    onClick={() => handleFieldCardClick(field)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary" />
                            <div>
                              <CardTitle className="text-xl font-semibold text-gray-800">{field.label}</CardTitle>
                              {field.description && (
                                <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Field type indicator */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {field.type === 'text' ? '📝 Text Field' :
                               field.type === 'email' ? '📧 Email Field' :
                               field.type === 'phone' ? '📞 Phone Field' :
                               field.type === 'number' ? '🔢 Number Field' :
                               field.type === 'text_area' ? '📄 Text Area' :
                               field.type === 'dropdown' ? '📋 Dropdown' :
                               field.type === 'radio' ? '⚪ Radio Buttons' :
                               field.type === 'checkboxes' ? '☑️ Checkboxes' :
                               field.type === 'file_upload' ? '📎 File Upload' :
                               '📝 Form Field'}
                            </span>
                            {field.required && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {field.subFields && field.subFields.length > 0 ? (
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                              📁 {field.subFields.length} sub-fields
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                              Ready for input
                            </span>
                          )}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Image upload fields in card layout (unchanged) */}
          {imageUploadFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ Image Upload Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageUploadFields.map(field => (
                  <Card 
                    key={field.fieldId} 
                    className="cursor-pointer hover:shadow-lg hover:border-primary hover:scale-105 transition-all duration-200 border-dashed"
                    onClick={() => handleFieldCardClick(field)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4 relative">
                      <FileText className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
                      
                      {field.imageUrl ? (
                        <img 
                          src={field.imageUrl} 
                          alt={field.imageName || field.label}
                          className="w-32 h-32 object-contain mb-2"
                        />
                      ) : (
                        <Image className="w-16 h-16 text-muted-foreground mb-2" />
                      )}
                      <CardTitle className="text-lg font-semibold text-center mt-2">{field.label}</CardTitle>
                      {field.description && <p className="text-sm text-muted-foreground text-center mt-1">{field.description}</p>}
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                          🖼️ Image Upload Field
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No fields message */}
          {fieldsToDisplay.length === 0 && (
            <p className="text-center text-muted-foreground">No fields available for this selection.</p>
          )}
        </>
      )}
    </div>
  );
};