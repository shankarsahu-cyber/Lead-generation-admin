import { Edit, Trash2, Upload, Image as ImageIcon, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  id: string;
  label: string;
  imageUrl?: string;
  allowMultiple?: boolean;
  isSelected?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string) => void;
  onImageRemove?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function ItemCard({
  id,
  label,
  imageUrl,
  allowMultiple = false,
  isSelected = false,
  onEdit,
  onDelete,
  onImageUpload,
  onImageRemove,
  onClick,
}: ItemCardProps) {
  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border-2 border-transparent hover:border-primary/20",
        "bg-gradient-to-br from-card via-card to-card/95",
        isSelected && "ring-2 ring-primary border-primary/30 shadow-lg translate-y-[-2px] bg-gradient-to-br from-primary/5 via-card to-card"
      )}
      onClick={() => onClick?.(id)}
      data-testid={`item-card-${id}`}
    >
      <CardContent className="p-0">
        {/* Image Section with enhanced styling */}
        <div className="aspect-square relative bg-gradient-to-br from-muted/50 to-muted rounded-t-lg overflow-hidden">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-testid={`item-image-${id}`}
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Upload className="h-6 w-6 text-primary/60" />
              </div>
              <span className="text-xs font-medium">Add Image</span>
            </div>
          )}
          
          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Star className="h-3 w-3 text-primary-foreground fill-current" />
            </div>
          )}
          
          {/* Enhanced overlay buttons with better positioning */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
            <div className="flex items-center gap-1.5">
              {imageUrl ? (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-md backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageUpload(id);
                    }}
                    data-testid={`button-change-image-${id}`}
                    title="Change Image"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                  {onImageRemove && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 px-3 shadow-md backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageRemove(id);
                      }}
                      data-testid={`button-remove-image-${id}`}
                      title="Remove Image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-md backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageUpload(id);
                  }}
                  data-testid={`button-upload-${id}`}
                  title="Upload Image"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-md backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                data-testid={`button-edit-${id}`}
                title="Edit Item"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-3 shadow-md backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                data-testid={`button-delete-${id}`}
                title="Delete Item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Label Section */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors" 
                data-testid={`item-label-${id}`}
                title={label}
              >
                {label}
              </h3>
            </div>
            {/* {allowMultiple && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center text-xs bg-gradient-to-r from-primary/15 to-primary/10 text-primary px-2 py-1 rounded-full font-medium border border-primary/20">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></div>
                  Multi
                </span>
              </div>
            )} */}
          </div>
          
          {/* Subtle bottom accent */}
          <div className={cn(
            "mt-3 h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 transition-all duration-300",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          )} />
        </div>
      </CardContent>
    </Card>
  );
}