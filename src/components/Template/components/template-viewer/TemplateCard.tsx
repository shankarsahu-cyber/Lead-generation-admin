
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
}

export const TemplateCard = ({ template, onEdit }: TemplateCardProps) => {
  const navigate = useNavigate();

  const getCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-elegant border-border/50">
      <div className="aspect-video w-full overflow-hidden bg-gradient-subtle">
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
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{template.name}</CardTitle>
          <Badge variant={template.isActive ? "default" : "secondary"} className="shrink-0">
            {template.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Badge variant="outline" className="font-normal">
          {getCategoryLabel(template.category)}
        </Badge>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(template)}
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/template-builder/${template.id}`)}
        >
          <Play className="mr-2 h-4 w-4" />
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};
