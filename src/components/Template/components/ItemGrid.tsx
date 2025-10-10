
import { Grid, Package, Sparkles } from "lucide-react";
import ItemCard from "./ItemCard";

export interface GridItem {
  id: string;
  label: string;
  imageUrl?: string;
  allowMultiple?: boolean;
}

interface ItemGridProps {
  items: GridItem[];
  selectedItemId?: string;
  onItemEdit: (id: string) => void;
  onItemDelete: (id: string) => void;
  onItemImageUpload: (id: string) => void;
  onItemImageRemove?: (id: string) => void;
  onItemClick?: (id: string) => void;
  onImageRemove?: (id: string) => void;
}

export default function ItemGrid({
  items,
  selectedItemId,
  onItemEdit,
  onItemDelete,
  onItemImageUpload,
  onImageRemove,
  onItemClick,
}: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8" data-testid="empty-grid">
        <div className="max-w-md mx-auto">
          {/* Enhanced empty state with better visual hierarchy */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-primary/60" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No items yet
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Get started by creating your first item. Click the{" "}
            <span className="font-medium text-foreground">"New Item"</span>{" "}
            button above to begin building your collection.
          </p>
          
          {/* Visual separator */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6" data-testid="item-grid">
      {/* Grid header with item count */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Grid className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Items</h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} total
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced grid with better responsive breakpoints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 auto-rows-max">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            label={item.label}
            imageUrl={item.imageUrl}
            allowMultiple={item.allowMultiple}
            isSelected={selectedItemId === item.id}
            onEdit={onItemEdit}
            onDelete={onItemDelete}
            onImageUpload={onItemImageUpload}
            onImageRemove={onImageRemove}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}