import { useState, useEffect } from "react";
// import { Template, TemplateCategory, CreateTemplateData } from "@/types/template";
// import { TemplateCard } from "@/components/templates/TemplateCard";
// import { TemplateFilters } from "@/components/templates/TemplateFilters";
// import { EditTemplateDialog } from "@/components/templates/EditTemplateDialog";
// import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CreateTemplateData, Template, TemplateCategory } from "@/types";
import { CreateTemplateDialog } from "./components/template-viewer/CreateTemplateDialog";
import { TemplateFilters } from "./components/template-viewer/TemplateFilters";
import { TemplateCard } from "./components/template-viewer/TemplateCard";
import { EditTemplateDialog } from "./components/template-viewer/EditTemplateDialog";

const API_BASE_URL = "https://api.adpair.co/api/admin/templates";
const FILTER_API_URL = "https://api.adpair.co/api/admin/templates/filter";

const TemplateViewer = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'ALL'>('ALL');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

 const fetchTemplates = async (category?: TemplateCategory | 'ALL') => {
  try {
    setLoading(true);

    // ✅ Get token from localStorage
    const storedUser = localStorage.getItem('user');
    const authToken = storedUser ? JSON.parse(storedUser).token : null;

    if (!authToken) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    // ✅ Build URL with new filter endpoint
    let url = `${FILTER_API_URL}?isActive&page=${page}&size=${size}`;
    
    // Add category if selected
    if (category && category !== 'ALL') {
      url += `&category=${category}`;
    }

    // ✅ API call with Authorization header
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch templates");

    const data = await response.json();
    setTemplates(data.content || data); // Handle pagination response structure
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load templates. Please try again.",
      variant: "destructive",
    });
    console.error("Error fetching templates:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTemplates(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (category: TemplateCategory | 'ALL') => {
    setSelectedCategory(category);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  };

const handleSaveTemplate = async (updatedTemplate: Partial<Template> & { id: number }) => {
  try {
    const template = templates.find(t => t.id === updatedTemplate.id);
    if (!template) return;

    // ✅ Get token from localStorage
    const storedUser = localStorage.getItem('user');
    const authToken = storedUser ? JSON.parse(storedUser).token : null;

    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in again.",
        variant: "destructive",
      });
      throw new Error("Authentication token not found. Please log in first.");
    }

    // ✅ Make API request with Authorization header using PUT method and templateID
    const response = await fetch(
      `${API_BASE_URL}/${updatedTemplate.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: updatedTemplate.name,
          description: updatedTemplate.description,
          category: updatedTemplate.category,
          formPayload: template.formPayload,
          isActive: updatedTemplate.isActive !== undefined ? updatedTemplate.isActive : template.isActive,
          imageUrl: updatedTemplate.imageUrl
        }),
      }
    );

    if (!response.ok) throw new Error('Failed to update template');

    // ✅ Refresh templates after successful update
    await fetchTemplates(selectedCategory);

    toast({
      title: "Success",
      description: "Template updated successfully.",
    });

  } catch (error) {
    console.error("Error updating template:", error);
    toast({
      title: "Error",
      description: "Failed to update template. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};


  const handleCreateTemplate = async (
    data: CreateTemplateData,
    category: TemplateCategory,
    imageUrl: string
  ) => {
    try {
      // Get token from localStorage
      const storedUser = localStorage.getItem('user');
      const authToken = storedUser ? JSON.parse(storedUser).token : null;

      if (!authToken) {
        throw new Error("Authentication token not found. Please log in first.");
      }

      // Make sure imageUrl is properly encoded in the URL
      const encodedImageUrl = imageUrl ? encodeURIComponent(imageUrl) : '';
      
      // Keep category as a query parameter and also include it in the body
      const response = await fetch(
        `${API_BASE_URL}?category=${category}&url=${encodedImageUrl}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            ...data,
            category: category
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to create template');

      // Refresh templates
      await fetchTemplates(selectedCategory);
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  };

  const filteredTemplates = templates;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-2 py-2 space-y-2">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Template Manager
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your form templates
            </p>
          </div>
          <CreateTemplateDialog onCreate={handleCreateTemplate} />
        </div>

        {/* Filters */}
        <TemplateFilters
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No templates found. Create your first template to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDelete={(id) => {
                  setTemplates(templates.filter(t => t.id !== id));
                  setFilteredTemplates(filteredTemplates.filter(t => t.id !== id));
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditTemplateDialog
        template={editingTemplate}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default TemplateViewer;





