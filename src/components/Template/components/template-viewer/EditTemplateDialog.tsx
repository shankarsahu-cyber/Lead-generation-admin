import { useState, useEffect, useRef } from "react";
// import { Template, TemplateCategory } from "@/types/template";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// import {  } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/lib/constant";
import { Template, TemplateCategory } from "@/types";

interface EditTemplateDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTemplate: Partial<Template> & { id: number }) => Promise<void>;
}

export const EditTemplateDialog = ({ template, open, onOpenChange, onSave }: EditTemplateDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "REAL_ESTATE" as TemplateCategory,
    isActive: true,
    imageUrl: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        isActive: template.isActive,
        imageUrl: template.imageUrl || "",
      });
      setSelectedFile(null);
    }
  }, [template]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

 const handleUploadImage = async () => {
  if (!selectedFile) {
    toast({
      title: "No file selected",
      description: "Please select an image file first.",
      variant: "destructive",
    });
    return;
  }

  const storedUser = localStorage.getItem('user');
  const authToken = storedUser ? JSON.parse(storedUser).token : null;

  if (!authToken) {
    toast({
      title: "Authentication required",
      description: "You are not logged in. Please log in first.",
      variant: "destructive",
    });
    return;
  }

  setUploading(true);
  try {
    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);

    const response = await fetch('https://api.adpair.co/api/admin/uploads/file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: uploadFormData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    // ✅ If API returns plain text (not JSON)
    const textData = await response.text();
    const imageUrl = textData?.trim(); // Just a string URL

    if (imageUrl) {
      setFormData({ ...formData, imageUrl });
      setSelectedFile(null);
      toast({
        title: "Image uploaded",
        description: "Image has been successfully uploaded.",
      });
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    toast({
      title: "Upload failed",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    });
    console.error("Error uploading image:", error);
  } finally {
    setUploading(false);
  }
};


  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      await onSave({
        id: template.id,
        ...formData,
        imageUrl: formData.imageUrl || null,
      });
      toast({
        title: "Template updated",
        description: "Your template has been successfully updated.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Update the template details below. The form structure will remain unchanged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter template description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          <div className="space-y-2">
            <Label htmlFor="imageUrl">Template Image</Label>
            
            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="edit-file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={uploading || saving}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                
                {selectedFile && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleUploadImage}
                    disabled={uploading || saving}
                    className="w-full sm:w-auto"
                  >
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                  </Button>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={uploading || saving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter URL directly
                  </span>
                </div>
              </div>

              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />

              {formData.imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={formData.imageUrl}
                    alt="Template preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Make this template available for use
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
