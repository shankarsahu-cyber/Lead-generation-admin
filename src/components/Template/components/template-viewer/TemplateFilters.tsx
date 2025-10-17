

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TemplateCategory } from "@/types";
import { TEMPLATE_CATEGORIES } from "@/lib/constant";

interface TemplateFiltersProps {
  selectedCategory: TemplateCategory | 'ALL';
  onCategoryChange: (category: TemplateCategory | 'ALL') => void;
}

export const TemplateFilters = ({ selectedCategory, onCategoryChange }: TemplateFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Filter by Category</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('ALL')}
          className="rounded-full"
        >
          All Templates
        </Button>
        
        {TEMPLATE_CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.value)}
            className="rounded-full"
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
