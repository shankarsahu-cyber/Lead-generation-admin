import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { label: string; allowMultiple: boolean }) => void;
  initialData: {
    label: string;
    allowMultiple: boolean;
  };
}

export default function EditItemDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditItemDialogProps) {
  const [label, setLabel] = useState(initialData.label);
  const [allowMultiple, setAllowMultiple] = useState(initialData.allowMultiple);

  const handleSave = () => {
    if (label.trim()) {
      onSave({ label: label.trim(), allowMultiple });
      onClose();
    }
  };

  const handleClose = () => {
    setLabel(initialData.label);
    setAllowMultiple(initialData.allowMultiple);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="edit-item-dialog">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter item label"
              data-testid="input-item-label"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowMultiple"
              checked={allowMultiple}
              onCheckedChange={(checked) => setAllowMultiple(!!checked)}
              data-testid="checkbox-allow-multiple"
            />
            <Label htmlFor="allowMultiple">Allow multiple selection</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!label.trim()} data-testid="button-save">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}