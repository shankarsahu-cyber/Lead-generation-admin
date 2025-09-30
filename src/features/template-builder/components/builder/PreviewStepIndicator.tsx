import React from 'react';
import { FormData, FormStep } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface PreviewStepIndicatorProps {
  formData: FormData;
  currentStepId: string;
  onStepClick: (stepId: string) => void;
}

export const PreviewStepIndicator = ({
  formData,
  currentStepId,
  onStepClick,
}: PreviewStepIndicatorProps) => {
  const currentStepIndex = formData.steps.findIndex(step => step.stepId === currentStepId);

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {formData.steps.map((step, index) => {
        const isCurrent = step.stepId === currentStepId;
        const isCompleted = index < currentStepIndex;

        // Find a representative image for the step, if any
        // For simplicity, we'll look for the first image_upload field's image in the step's top-level fields.
        const stepImageField = step.fields.find(field => field.type === 'image_upload' && field.imageUrl);

        return (
          <React.Fragment key={step.stepId}>
            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onStepClick(step.stepId)}
            >
              <div 
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 
                  ${isCurrent ? 'bg-primary text-primary-foreground scale-110' : isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                  border-2 ${isCurrent ? 'border-primary' : 'border-transparent'}
                `}
              >
                {stepImageField?.imageUrl ? (
                  <img 
                    src={stepImageField.imageUrl}
                    alt={step.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />
                )}
                
              </div>
              <p 
                className={`mt-2 text-xs font-medium text-center 
                  ${isCurrent ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                `}
              >
                {step.title}
              </p>
            </div>
            {index < formData.steps.length - 1 && (
              <div 
                className={`flex-1 h-0.5 bg-muted transition-colors duration-200 
                  ${isCompleted ? 'bg-primary' : ''}
                `}
                style={{ minWidth: '20px', maxWidth: '40px' }} // Adjust line length
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
