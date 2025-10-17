
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Template } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete?: (templateId: number) => void;
}

export const TemplateCard = ({ template, onEdit, onDelete }: TemplateCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getCategoryLabel = (category: string) => {
    return category.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleDeleteConfirm = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const authToken = storedUser ? JSON.parse(storedUser).token : null;

      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "You are not logged in. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`https://api.adpair.co/api/admin/templates/${template.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Template Deleted",
          description: "Template has been successfully deleted.",
        });
        if (onDelete) {
          onDelete(template.id);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete template. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-elegant border-border/50">
        <div className="relative">
          <div className="aspect-square w-full overflow-hidden bg-gradient-subtle">
            {template.imageUrl ? (
              <img
                src={template.imageUrl}
                alt={template.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                <span className="text-4xl font-bold text-primary-foreground opacity-50">
                  {template.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge variant={template.isActive ? "default" : "secondary"} className="shrink-0">
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-3 pb-0">
          <CardTitle className="line-clamp-1 text-base">{template.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs mt-1">{template.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="p-3 pt-2">
          <Badge variant="outline" className="font-normal text-xs">
            {getCategoryLabel(template.category)}
          </Badge>
        </CardContent>
        
        <CardFooter className="flex gap-1 p-3 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onEdit(template)}
          >
            <Edit2 className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => navigate(`/template-builder/${template.id}`)}
          >
            <Play className="mr-1 h-3 w-3" />
            Use
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              "{template.name}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
