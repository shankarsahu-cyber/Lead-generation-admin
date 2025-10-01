import { useState } from 'react';
import { FormData, FormStep, FormField, FieldType } from '../../types/template-builder';
import { updateTemplate } from '../../services/api';
import { useToast } from '@/hooks/use-toast';
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
  ChevronLeft,
  Save
} from 'lucide-react';
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
  isFormDetailsComplete: boolean;
  onNavigateToMyForms?: () => void;
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
  isFormDetailsComplete,
  onNavigateToMyForms
}: BuilderContentProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentFormValues, setCurrentFormValues] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleUpdateTemplate = async () => {
    if (!formData.id) {
      toast({
        title: "Update Failed",
        description: "Template ID is missing. Please save the template first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await updateTemplate(formData.id, formData, toast);
      if (result.success && onNavigateToMyForms) {
        onNavigateToMyForms();
      }
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setCurrentFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));

    if (step && step.nextStepCondition) {
      for (const condition of step.nextStepCondition) {
        if (currentFormValues[condition.fieldId] === condition.value) {
          onStepSelect(condition.nextStepId);
          return;
        }
      }
    }

    const currentField = getNestedField(step?.fields || [], [...selectedFieldPath, fieldId]);
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
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
        <div className="text-center max-w-md mx-auto">
          <h3 className="text-lg sm:text-xl font-medium text-muted-foreground mb-2">No Step Selected</h3>
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

  const updateFieldRecursive = (fields: FormField[], path: string[], updateFn: (field: FormField) => FormField): FormField[] => {
    if (path.length === 0) return fields;

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
      ...(type === 'image_upload' ? { imageUrl: '', imageName: '' } : {}),
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
    addNewFieldToPath(selectedFieldPath, type);
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

  const getFieldById = (fields: FormField[], fieldId: string): FormField | null => {
    for (const field of fields) {
      if (field.fieldId === fieldId) return field;
      const found = getFieldById(field.subFields, fieldId);
      if (found) return found;
    }
    return null;
  };

  const handleUpdateField = (fieldId: string, updatedField: FormField) => {
    const updateFields = (fields: FormField[]): FormField[] => {
      return fields.map(field => {
        if (field.fieldId === fieldId) {
          return updatedField;
        }
        return {
          ...field,
          subFields: updateFields(field.subFields)
        };
      });
    };

    const updatedStep = {
      ...step,
      fields: updateFields(step.fields)
    };

    const updatedFormData = {
      ...formData,
      steps: formData.steps.map(s => s.stepId === step.stepId ? updatedStep : s)
    };

    onFormDataChange(updatedFormData);
  };

  const handleDeleteField = (fieldId: string) => {
    deleteField(fieldId);
  };

  const handleAddField = (type: FieldType) => {
    addNewField(type);
  };

  const handleAddSubfield = (parentFieldId: string, type: FieldType) => {
    addNewFieldToPath([...selectedFieldPath, parentFieldId], type);
  };

  const currentFields = getCurrentFields();
  const breadcrumb = selectedFieldPath.length > 0 
    ? ` > ${selectedFieldPath.map(id => getNestedField(step.fields, [id])?.label || id).join(' > ')}`
    : '';

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-border bg-muted/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate">
              {step.title}{breadcrumb}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {currentFields.length} field{currentFields.length !== 1 ? 's' : ''} in this step
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {selectedFieldPath.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFieldSelect(selectedFieldPath.slice(0, -1))}
                className="h-8 px-3 text-xs w-full sm:w-auto"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}
            {formData.id && (
              <Button
                onClick={handleUpdateTemplate}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs w-full sm:w-auto"
              >
                <Save className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Update Template</span>
                <span className="sm:hidden">Update</span>
              </Button>
            )}
            <FieldTypeDropdown
              onSelectType={handleAddField}
              disabled={!isFormDetailsComplete}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 sm:p-4 lg:p-6">
            {currentFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 sm:h-8 w-6 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No Fields Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md px-4">
                  Add your first field to start building your form
                </p>
                <FieldTypeDropdown
                  onSelectType={handleAddField}
                  disabled={!isFormDetailsComplete}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {currentFields.map((field) => (
                  <FieldCard
                    key={field.fieldId}
                    field={field}
                    onEdit={() => setEditingField(field.fieldId)}
                    onDelete={() => handleDeleteField(field.fieldId)}
                    onSelect={() => onFieldSelect([...selectedFieldPath, field.fieldId])}
                    updateFieldRecursive={updateFieldRecursive}
                    currentStep={step}
                    formData={formData}
                    selectedFieldPath={selectedFieldPath}
                    onFormDataChange={onFormDataChange}
                    onAddSubfield={handleAddSubfield}
                    handleFieldChange={handleFieldChange}
                    onValueChange={handleFieldChange}
                    isFormDetailsComplete={isFormDetailsComplete}
                    currentFormValues={currentFormValues}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditor
          fieldId={editingField}
          step={step}
          formData={formData}
          selectedFieldPath={selectedFieldPath}
          onClose={() => setEditingField(null)}
          onSave={onFormDataChange}
          onFieldSelect={onFieldSelect}
          allSteps={formData.steps}
        />
      )}
    </div>
  );
};

const FieldTypeDropdown = ({
  onSelectType,
  disabled
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
        className="gap-1 sm:gap-2 bg-gradient-to-r from-builder-primary to-builder-secondary hover:opacity-90 text-xs sm:text-sm w-full sm:w-auto"
        size="sm"
        disabled={disabled}
      >
        <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
        <span className="hidden sm:inline">Add Field</span>
        <span className="sm:hidden">Add</span>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 w-64 sm:w-max">
          <div className="p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {fieldTypes.map((type) => {
                const Icon = fieldTypeIcons[type];
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-auto p-2 text-xs sm:text-sm"
                    onClick={() => {
                      onSelectType(type);
                      setIsOpen(false);
                    }}
                    disabled={disabled}
                  >
                    <Icon className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="truncate">{fieldTypeLabels[type]}</span>
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
  onValueChange: (fieldId: string, value: any) => void;
  isFormDetailsComplete: boolean;
  currentFormValues: Record<string, any>;
}

const FieldCard = ({
  field,
  onEdit,
  onDelete,
  onSelect,
  onAddSubfield,
  onValueChange,
  isFormDetailsComplete,
  currentFormValues
}: FieldCardProps) => {
  const Icon = fieldTypeIcons[field.type];
  
  // Special handling for image upload fields
  if (field.type === 'image_upload') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3 p-3 sm:p-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {field.imageUrl ? (
                <div className="relative w-12 sm:w-16 h-12 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border">
                  <img src={field.imageUrl} alt={field.imageName || field.label} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base font-medium truncate">{field.label}</CardTitle>
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
                disabled={!isFormDetailsComplete}
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
                disabled={!isFormDetailsComplete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {field.imageUrl && (
            <div className="mt-3 relative w-full h-32 sm:h-48 rounded-md overflow-hidden border">
              <img
                src={field.imageUrl}
                alt={field.imageName || field.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 sm:p-3">
                <CardTitle className="text-white text-sm sm:text-lg font-semibold truncate">
                  {field.imageName || field.label}
                </CardTitle>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 p-3 sm:p-6" onClick={onSelect}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 flex-wrap">
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
      <CardHeader className="pb-3 p-3 sm:p-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Icon className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base font-medium truncate">{field.label}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">{fieldTypeLabels[field.type]}</p>
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
              className="h-6 sm:h-8 w-6 sm:w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              disabled={!isFormDetailsComplete}
            >
              <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 sm:h-8 w-6 sm:w-8 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={!isFormDetailsComplete}
            >
              <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-3 sm:p-6" onClick={onSelect}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 sm:gap-2 flex-wrap">
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
      <CardContent className="pt-0 border-t mt-2 sm:mt-4 p-3 sm:p-6">
        <div className="py-2">
          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder || "Enter text"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete}
              className="text-sm"
            />
          )}
          {field.type === 'email' && (
            <Input
              type="email"
              placeholder={field.placeholder || "Enter email"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete}
              className="text-sm"
            />
          )}
          {field.type === 'phone' && (
            <Input
              type="tel"
              placeholder={field.placeholder || "Enter phone number"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete}
              className="text-sm"
            />
          )}
          {field.type === 'number' && (
            <Input
              type="number"
              placeholder={field.placeholder || "Enter number"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete}
              className="text-sm"
            />
          )}
          {field.type === 'text_area' && (
            <Textarea
              placeholder={field.placeholder || "Enter a detailed response"}
              onChange={(e) => onValueChange(field.fieldId, e.target.value)}
              disabled={!isFormDetailsComplete}
              className="text-sm resize-none"
              rows={3}
            />
          )}
          {(field.type === 'dropdown' || field.type === 'radio') && field.options && (
            <Select onValueChange={(value) => onValueChange(field.fieldId, value)} disabled={!isFormDetailsComplete}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map(option => (
                  <SelectItem key={option.optionId} value={option.value} className="text-sm">
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
                    disabled={!isFormDetailsComplete}
                  />
                  <Label htmlFor={option.optionId} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};