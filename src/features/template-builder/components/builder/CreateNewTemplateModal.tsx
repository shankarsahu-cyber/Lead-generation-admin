import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TEMPLATE_CATEGORIES, TemplateCategory } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

interface CreateNewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, category: TemplateCategory) => void;
}

export const CreateNewTemplateModal: React.FC<CreateNewTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory | ''>('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!templateName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required.',
        variant: 'destructive',
      });
      return;
    }
    if (!templateDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template description is required.',
        variant: 'destructive',
      });
      return;
    }
    if (!templateCategory) {
      toast({
        title: 'Validation Error',
        description: 'Template category is required.',
        variant: 'destructive',
      });
      return;
    }

    onCreate(templateName, templateDescription, templateCategory);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Enter the details for your new template. All fields are mandatory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="col-span-3 resize-none"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={templateCategory} onValueChange={(value: TemplateCategory) => setTemplateCategory(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Create Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
