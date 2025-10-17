import { useState, useRef } from "react";
// import { TemplateCategory, CreateTemplateData } from "@/types/template";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEMPLATE_CATEGORIES, DEFAULT_TEMPLATE_STEPS } from "@/lib/constant";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Upload, X, CloudCog } from "lucide-react";
import { CreateTemplateData, TemplateCategory } from "@/types";

interface CreateTemplateDialogProps {
  onCreate: (data: CreateTemplateData, category: TemplateCategory, imageUrl: string) => Promise<void>;
}

export const CreateTemplateDialog = ({ onCreate }: CreateTemplateDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "REAL_ESTATE" as TemplateCategory,
    imageUrl: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
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

  // ✅ Get token from localStorage
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
        'Authorization': `Bearer ${authToken}`,
        // Note: Do NOT set 'Content-Type' when using FormData; browser will handle it
      },
      body: uploadFormData
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      // If the response is a direct URL string
      if (responseText.includes('http')) {
        data = { url: responseText.trim() };
      } else {
        throw error;
      }
    }

    // Extract image URL from response
    let imageUrl = '';
    
    if (typeof data === 'string' && data.includes('http')) {
      imageUrl = data.trim();
    } else if (data && typeof data === 'object') {
      imageUrl = data.url || data.imageUrl || data.data?.url || '';
    }
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

  const handleCreate = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const templateData: CreateTemplateData = {
        name: formData.name,
        description: formData.description,
        steps: DEFAULT_TEMPLATE_STEPS,
        settings: {
          successMessage: `Thanks! We'll get back to you soon.`,
        },
      };

      await onCreate(templateData, formData.category, formData.imageUrl);
      
      toast({
        title: "Template created",
        description: "Your new template has been successfully created.",
      });
      
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        category: "REAL_ESTATE",
        imageUrl: "",
      });
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-elegant">
          <Plus className="mr-2 h-5 w-5" />
          Create Template
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl w-full sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a new template with default form structure. You can customize it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="create-name">Template Name *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Real Estate Inquiry"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">Description *</Label>
            <Textarea
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the template"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}
            >
              <SelectTrigger id="create-category">
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
            <Label htmlFor="create-imageUrl">Template Image</Label>
            
            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                
                {selectedFile && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleUploadImage}
                    disabled={uploading}
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
                    disabled={uploading}
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
                    Image URL
                  </span>
                </div>
              </div>

              <Input
                id="create-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Enter image URL or upload an image"
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
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating} className="w-full sm:w-auto">
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
