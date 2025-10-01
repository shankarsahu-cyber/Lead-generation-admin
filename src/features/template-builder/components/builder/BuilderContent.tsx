import { useState } from 'react';
import { FormData, FormStep, FormField, FieldType } from '../../types/form-builder';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { FieldEditor } from './FieldEditor';
import {
  Plus,
  Type,
  Mail,
  Phone,
  Hash,
  FileText,
  ChevronDown,
  CheckSquare,
  Upload,
  Image,
  Circle,
  Edit,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { ImageUpload } from './ImageUpload'; // Import the new ImageUpload component
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface BuilderContentProps {
  step: FormStep | undefined;
  formData: FormData;
  selectedFieldPath: string[];
  onFormDataChange: (data: FormData) => void;
  onFieldSelect: (fieldPath: string[]) => void;
  onStepSelect: (stepId: string) => void;
  isFormDetailsComplete: boolean; // New prop
}

const fieldTypeIcons: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  text_area: FileText,
  dropdown: ChevronDown,
  checkboxes: CheckSquare,
  file_upload: Upload,
  image_upload: Image,
  radio: Circle
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Text Input',
  email: 'Email',
  phone: 'Phone',
  number: 'Number',
  text_area: 'Text Area',
  dropdown: 'Dropdown',
  checkboxes: 'Checkboxes',
  file_upload: 'File Upload',
  image_upload: 'Image Upload',
  radio: 'Radio Buttons'
};

export const BuilderContent = ({
  step,
  formData,
  selectedFieldPath,
  onFormDataChange,
  onFieldSelect,
  onStepSelect,
  isFormDetailsComplete // Destructure new prop
}: BuilderContentProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentFormValues, setCurrentFormValues] = useState<Record<string, any>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setCurrentFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Check for next step condition on the current step
    if (step && step.nextStepCondition) {
      for (const condition of step.nextStepCondition) {
        if (currentFormValues[condition.fieldId] === condition.value) {
          onStepSelect(condition.nextStepId);
          return;
        }
      }
    }

    // Check for next step condition on options within the current field
    const currentField = getNestedField(step.fields, [...selectedFieldPath, fieldId]);
    if (currentField && currentField.options) {
      const selectedOption = currentField.options.find(option => option.value === value);
      if (selectedOption && selectedOption.nextStepId) {
        onStepSelect(selectedOption.nextStepId);
        return;
      }
    }
  };

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Step Selected</h3>
          <p className="text-sm text-muted-foreground">Select a step from the sidebar to view its fields</p>
        </div>
      </div>
    );
  }

  const getNestedField = (fields: FormField[], path: string[]): FormField | null => {
    if (path.length === 0) return null;
    
    const field = fields.find(f => f.fieldId === path[0]);
    if (!field) return null;
    
    if (path.length === 1) return field;
    
    return getNestedField(field.subFields, path.slice(1));
  };

  const getCurrentFields = (): FormField[] => {
    if (selectedFieldPath.length === 0) {
      return step.fields;
    }
    
    const parentField = getNestedField(step.fields, selectedFieldPath);
    return parentField?.subFields || [];
  };

  // Helper to recursively update a field or subfield
  const updateFieldRecursive = (fields: FormField[], path: string[], updateFn: (field: FormField) => FormField): FormField[] => {
    if (path.length === 0) return fields; // Should not happen for a targeted update

    return fields.map(field => {
      if (field.fieldId === path[0]) {
        if (path.length === 1) {
          return updateFn(field);
        } else {
          return {
            ...field,
            subFields: updateFieldRecursive(field.subFields, path.slice(1), updateFn)
          };
        }
      }
      return field;
    });
  };

  // Helper to add a new field at a specific path, or as a subfield to a given parent ID
  const addNewFieldToPath = (path: string[], type: FieldType) => {
    const newFieldId = `field_${Date.now()}`;
    const newField: FormField = {
      fieldId: newFieldId,
      type,
      label: `New ${fieldTypeLabels[type]}`,
      required: false,
      subFields: [],
      ...(type === 'dropdown' || type === 'checkboxes' || type === 'radio'
        ? { options: [] } 
        : {}),
      ...(type === 'image_upload' ? { imageUrl: '' } : {}),
      ...(type === 'image_upload' ? { imageName: '' } : {}),
    };

    const updateFieldsRecursive = (currentFields: FormField[], targetPath: string[]): FormField[] => {
      if (targetPath.length === 0) {
        return [...currentFields, newField];
      }

      const [head, ...tail] = targetPath;
      return currentFields.map(field => {
        if (field.fieldId === head) {
          return {
            ...field,
            subFields: updateFieldsRecursive(field.subFields, tail)
          };
        }
        return field;
      });
    };

    const updatedStep = {
      ...step,
      fields: updateFieldsRecursive(step.fields, path)
    };

    const updatedFormData = {
      ...formData,
      steps: formData.steps.map(s => s.stepId === step.stepId ? updatedStep : s)
    };

    onFormDataChange(updatedFormData);
  };

  const addNewField = (type: FieldType) => {
    addNewFieldToPath(selectedFieldPath, type); // Add to the current selected path
  };

  const deleteField = (fieldId: string) => {
    const updateFields = (fields: FormField[], path: string[]): FormField[] => {
      if (path.length === 0) {
        return fields.filter(f => f.fieldId !== fieldId);
      }
      
      return fields.map(field => {
        if (field.fieldId === path[0]) {
          if (path.length === 1) {
            return {
              ...field,
              subFields: field.subFields.filter(f => f.fieldId !== fieldId)
            };
          } else {
            return {
              ...field,
              subFields: updateFields(field.subFields, path.slice(1))
            };
          }
        }
        return field;
      });
    };

    const updatedStep = {
      ...step,
      fields: updateFields(step.fields, selectedFieldPath)
    };

    const updatedFormData = {
      ...formData,
      steps: formData.steps.map(s => s.stepId === step.stepId ? updatedStep : s)
    };

    onFormDataChange(updatedFormData);
  };

  const currentFields = getCurrentFields();
  const breadcrumb = selectedFieldPath.length > 0 
    ? ` > ${selectedFieldPath.map(id => getNestedField(step.fields, [id])?.label || id).join(' > ')}`
    : '';

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 md:p-6 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground truncate max-w-[calc(100vw-120px)] md:max-w-none">{step.title}{breadcrumb}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {currentFields.length} field{currentFields.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedFieldPath.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFieldSelect(selectedFieldPath.slice(0, -1))}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <FieldTypeDropdown onSelectType={addNewField} disabled={!isFormDetailsComplete} />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          {currentFields.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Fields Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first field to start building your form
              </p>
              <FieldTypeDropdown onSelectType={addNewField} disabled={!isFormDetailsComplete} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentFields.map((field) => (
                <FieldCard
                  key={field.fieldId}
                  field={field}
                  onEdit={() => setEditingField(field.fieldId)}
                  onDelete={() => deleteField(field.fieldId)}
                  onSelect={() => onFieldSelect([...selectedFieldPath, field.fieldId])}
                  updateFieldRecursive={updateFieldRecursive}
                  currentStep={step}
                  formData={formData}
                  selectedFieldPath={selectedFieldPath}
                  onFormDataChange={onFormDataChange}
                  onAddSubfield={(parentFieldId, type) => addNewFieldToPath([...selectedFieldPath, parentFieldId], type)}
                  handleFieldChange={handleFieldChange}
                  onValueChange={handleFieldChange} // Pass handleFieldChange to onValueChange
                  isFormDetailsComplete={isFormDetailsComplete} // Pass the new prop
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {editingField && (
        <FieldEditor
          fieldId={editingField}
          step={step}
          formData={formData}
          selectedFieldPath={selectedFieldPath}
          onClose={() => setEditingField(null)}
          onSave={onFormDataChange}
          onFieldSelect={onFieldSelect} // Pass onFieldSelect
          allSteps={formData.steps} // Pass all steps
        />
      )}
    </div>
  );
};

const FieldTypeDropdown = ({
  onSelectType,
  disabled // Add disabled prop here
}: { onSelectType: (type: FieldType) => void; disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const fieldTypes: FieldType[] = [
    'text', 'email', 'phone', 'number', 'text_area', 
    'dropdown', 'checkboxes', 'radio', 
    'file_upload', 'image_upload'
  ];

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 bg-gradient-to-r from-builder-primary to-builder-secondary hover:opacity-90"
        disabled={disabled} // Apply disabled prop to the button
      >
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 w-max">
          <div className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {fieldTypes.map((type) => {
                const Icon = fieldTypeIcons[type];
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-auto p-2"
                    onClick={() => {
                      onSelectType(type);
                      setIsOpen(false);
                    }}
                    disabled={disabled} // Apply disabled prop to dropdown items
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs truncate">{fieldTypeLabels[type]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

interface FieldCardProps {
  field: FormField;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  updateFieldRecursive: (fields: FormField[], path: string[], updateFn: (field: FormField) => FormField) => FormField[];
  currentStep: FormStep;
  formData: FormData;
  selectedFieldPath: string[];
  onFormDataChange: (data: FormData) => void;
  onAddSubfield: (parentFieldId: string, type: FieldType) => void;
  handleFieldChange: (fieldId: string, value: any) => void;
  onValueChange: (fieldId: string, value: any) => void; // Add this line
  isFormDetailsComplete: boolean; // New prop
}

const FieldCard = ({
  field,
  onEdit,
  onDelete,
  onSelect,
  updateFieldRecursive,
  currentStep,
  formData,
  selectedFieldPath,
  onFormDataChange,
  onAddSubfield,
  handleFieldChange,
  onValueChange,
  isFormDetailsComplete // Destructure new prop
}: FieldCardProps) => {
  const Icon = fieldTypeIcons[field.type];
  
  // Special handling for image upload fields - keep their current appearance
  if (field.type === 'image_upload') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {field.imageUrl ? (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border">
                  <img src={field.imageUrl} alt={field.imageName || field.label} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium truncate">{field.label}</CardTitle>
                <p className="text-xs text-muted-foreground">{fieldTypeLabels[field.type]}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                disabled={!isFormDetailsComplete} // Disable if form details are not complete
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={!isFormDetailsComplete} // Disable if form details are not complete
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {field.imageUrl && (
            <div className="mt-3 relative w-full h-48 rounded-md overflow-hidden border">
              <img
                src={field.imageUrl}
                alt={field.imageName || field.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <CardTitle className="text-white text-lg font-semibold truncate">
                  {field.imageName || field.label}
                </CardTitle>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0" onClick={onSelect}>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {field.required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
              {field.subFields.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {field.subFields.length} sub-field{field.subFields.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <FieldTypeDropdown onSelectType={(type) => onAddSubfield(field.fieldId, type)} disabled={!isFormDetailsComplete} />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Consistent card layout for all other field types
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium truncate">{field.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{fieldTypeLabels[field.type]}</p>
              {field.placeholder && (
                <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                  Placeholder: {field.placeholder}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              disabled={!isFormDetailsComplete} // Disable if form details are not complete
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={!isFormDetailsComplete} // Disable if form details are not complete
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {field.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
            {field.subFields.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {field.subFields.length} sub-field{field.subFields.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {(field.type === 'dropdown' || field.type === 'checkboxes' || field.type === 'radio') && field.options && (
              <Badge variant="outline" className="text-xs">
                {field.options.length} option{field.options.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <FieldTypeDropdown onSelectType={(type) => onAddSubfield(field.fieldId, type)} disabled={!isFormDetailsComplete} />
        </div>
      </CardContent>
      {/* Render input element for preview/interaction */}
      <CardContent className="pt-0 border-t mt-4">
        <div className="py-2">
          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder || "Enter text"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete} // Disable input
            />
          )}
          {field.type === 'email' && (
            <Input
              type="email"
              placeholder={field.placeholder || "Enter email"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete} // Disable input
            />
          )}
          {field.type === 'phone' && (
            <Input
              type="tel"
              placeholder={field.placeholder || "Enter phone number"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete} // Disable input
            />
          )}
          {field.type === 'number' && (
            <Input
              type="number"
              placeholder={field.placeholder || "Enter number"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete} // Disable input
            />
          )}
          {field.type === 'text_area' && (
            <Textarea
              placeholder={field.placeholder || "Enter a detailed response"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete} // Disable textarea
            />
          )}
          {(field.type === 'dropdown' || field.type === 'radio') && field.options && (
            <Select onValueChange={(value) => onValueChange(field.fieldId, value)} disabled={!isFormDetailsComplete}> // Disable select
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map(option => (
                  <SelectItem key={option.optionId} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === 'checkboxes' && field.options && (
            <div className="space-y-2">
              {field.options.map(option => (
                <div key={option.optionId} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.optionId}
                    onCheckedChange={(checked) => {
                      const currentValues = currentFormValues[field.fieldId] || [];
                      if (checked) {
                        onValueChange(field.fieldId, [...currentValues, option.value]);
                      } else {
                        onValueChange(field.fieldId, currentValues.filter((val: string) => val !== option.value));
                      }
                    }}
                    disabled={!isFormDetailsComplete} // Disable checkbox
                  />
                  <Label htmlFor={option.optionId}>{option.label}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};