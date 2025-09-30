import { useState, useEffect } from 'react';
import { FormData, FormStep, FormField, FieldType, FieldOption } from '@/types/form-builder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface FieldEditorProps {
  fieldId: string;
  step: FormStep;
  formData: FormData;
  selectedFieldPath: string[];
  onClose: () => void;
  onSave: (data: FormData) => void;
  onFieldSelect: (fieldPath: string[]) => void; // Add this line
  allSteps: FormStep[]; // Add this line
}

export const FieldEditor = ({
  fieldId,
  step,
  formData,
  selectedFieldPath,
  onClose,
  onSave,
  onFieldSelect,
  allSteps,
}: FieldEditorProps) => {
  const [field, setField] = useState<FormField | null>(null);

  useEffect(() => {
    const getField = (fields: FormField[], path: string[]): FormField | null => {
      if (path.length === 0) {
        return fields.find(f => f.fieldId === fieldId) || null;
      }
      
      const parentField = fields.find(f => f.fieldId === path[0]);
      if (!parentField) return null;
      
      if (path.length === 1) {
        return parentField.subFields.find(f => f.fieldId === fieldId) || null;
      }
      
      return getField(parentField.subFields, path.slice(1));
    };

    const foundField = getField(step.fields, selectedFieldPath);
    setField(foundField);
  }, [fieldId, step, selectedFieldPath]);

  const handleSave = () => {
    if (!field) return;

    const updateField = (fields: FormField[], path: string[]): FormField[] => {
      if (path.length === 0) {
        return fields.map(f => f.fieldId === fieldId ? field : f);
      }
      
      return fields.map(f => {
        if (f.fieldId === path[0]) {
          if (path.length === 1) {
            return {
              ...f,
              subFields: f.subFields.map(sf => sf.fieldId === fieldId ? field : sf)
            };
          } else {
            return {
              ...f,
              subFields: updateField(f.subFields, path.slice(1))
            };
          }
        }
        return f;
      });
    };

    const updatedStep = {
      ...step,
      fields: updateField(step.fields, selectedFieldPath)
    };

    const updatedFormData = {
      ...formData,
      steps: formData.steps.map(s => s.stepId === step.stepId ? updatedStep : s)
    };

    onSave(updatedFormData);
    onClose();
  };

  const addOption = () => {
    if (!field) return;
    
    const newOption: FieldOption = {
      optionId: `option_${Date.now()}`,
      label: 'New Option',
      value: 'new_option'
    };

    setField({
      ...field,
      options: [...(field.options || []), newOption]
    });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    if (!field || !field.options) return;
    
    const newOptions = [...field.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    
    setField({
      ...field,
      options: newOptions
    });
  };

  const removeOption = (index: number) => {
    if (!field || !field.options) return;
    
    setField({
      ...field,
      options: field.options.filter((_, i) => i !== index)
    });
  };

  if (!field) return null;

  const hasOptions = ['dropdown', 'checkboxes', 'radio'].includes(field.type);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={field.label}
                onChange={(e) => setField({ ...field, label: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Field Type</Label>
              <Select
                value={field.type}
                onValueChange={(value: FieldType) => setField({ ...field, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text_area">Text Area</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="checkboxes">Checkboxes</SelectItem>
                  <SelectItem value="radio">Radio Buttons</SelectItem>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                  <SelectItem value="image_upload">Image Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={field.required}
              onCheckedChange={(checked) => setField({ ...field, required: checked })}
            />
            <Label htmlFor="required">Required field</Label>
          </div>

          {field.type === 'image_upload' && (
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
                value={field.imageUrl || ''}
                onChange={(url) => setField({ ...field, imageUrl: url })}
                onRemove={() => setField({ ...field, imageUrl: undefined })}
              />
              <div className="space-y-2 mt-4">
                <Label htmlFor="image-name">Image Name</Label>
                <Input
                  id="image-name"
                  value={field.imageName || ''}
                  onChange={(e) => setField({ ...field, imageName: e.target.value })}
                  placeholder="Enter image name"
                />
              </div>
            </div>
          )}

          {hasOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-3">
                {(field.options || []).map((option, index) => (
                  <div key={option.optionId} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Option label"
                        value={option.label}
                        onChange={(e) => updateOption(index, { label: e.target.value })}
                      />
                      <Input
                        placeholder="Option value"
                        value={option.value}
                        onChange={(e) => updateOption(index, { value: e.target.value })}
                      />
                      <Select
                        value={option.nextStepId || ''}
                        onValueChange={(value) => updateOption(index, { nextStepId: value || undefined })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Go to step..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allSteps.map(s => (
                            <SelectItem key={s.stepId} value={s.stepId}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* {field.type === 'image_select' && (
                      <div className="flex-1">
                        <ImageUpload
                          value={option.imageUrl || ''}
                          onChange={(url) => updateOption(index, { imageUrl: url })}
                        />
                      </div>
                    )} */}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="h-10 w-10 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};