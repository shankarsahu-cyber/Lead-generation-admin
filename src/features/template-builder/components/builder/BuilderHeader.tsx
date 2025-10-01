import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { FormData, APIFormData, ExportFormat } from '../../types/template-builder';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TEMPLATE_CATEGORIES, TemplateCategory } from '../../services/api';
import {
  Upload,
  Download,
  Settings,
  CreditCard,
  Plus,
  Eye,
  Edit2,
  Check,
  X,
  Menu,
  FileText,
  Tag
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface BuilderHeaderProps {
  formName: string;
  formDescription: string;
  formCategory: TemplateCategory;
  onFormNameChange: (name: string) => void;
  onFormDescriptionChange: (description: string) => void;
  onFormCategoryChange: (category: TemplateCategory) => void;
  onImportJSON: (data: FormData | APIFormData) => void;
  onExportJSON: () => void;
  onPreview: () => void;
  onSaveForm: () => void; // Add onSaveForm prop
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  onToggleDashboard: () => void;
  isDashboardActive: boolean;
  onToggleBuilderSidebar: () => void; // New prop
  isBuilderSidebarOpen: boolean; // New prop
  onNewForm: () => void; // New prop for creating a new form
  isSaving?: boolean; // Add loading state prop
}

export const BuilderHeader = ({
  formName,
  formDescription,
  formCategory,
  onFormNameChange,
  onFormDescriptionChange,
  onFormCategoryChange,
  onImportJSON,
  onExportJSON,
  onPreview,
  onSaveForm, // Destructure onSaveForm prop
  exportFormat,
  onExportFormatChange,
  onToggleDashboard,
  isDashboardActive,
  onToggleBuilderSidebar, // Destructure new prop
  isBuilderSidebarOpen, // Destructure new prop
  onNewForm, // Destructure new prop
  isSaving = false // Destructure isSaving prop with default value
}: BuilderHeaderProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editName, setEditName] = useState(formName);
  const [editDescription, setEditDescription] = useState(formDescription);
  const [editCategory, setEditCategory] = useState(formCategory);
  const { toast } = useToast();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            // Remove "Generated form data: " prefix if present
            const jsonContent = content.replace(/^Generated form data:\s*/, '');
            const data = JSON.parse(jsonContent);
            onImportJSON(data);
            toast({
              title: "Import Successful",
              description: "Form data imported successfully",
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid JSON format",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveName = () => {
    onFormNameChange(editName);
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditName(formName);
    setIsEditingName(false);
  };

  const handleSaveDescription = () => {
    onFormDescriptionChange(editDescription);
    setIsEditingDescription(false);
  };

  const handleCancelEditDescription = () => {
    setEditDescription(formDescription);
    setIsEditingDescription(false);
  };

  const handleSaveCategory = () => {
    onFormCategoryChange(editCategory);
    setIsEditingCategory(false);
  };

  const handleCancelEditCategory = () => {
    setEditCategory(formCategory);
    setIsEditingCategory(false);
  };

  return (
    <header className="h-auto min-h-16 sm:min-h-20 border-b bg-card flex flex-col gap-3 shadow-sm p-3 sm:p-4 lg:p-5">
      {/* Top Row - Mobile Menu + Actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Toggle Builder Sidebar button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleBuilderSidebar}
          className="lg:hidden flex-shrink-0 h-8 w-8 p-0"
        >
          {isBuilderSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-nowrap">
          <Select
            value={exportFormat}
            onValueChange={(value: ExportFormat) => onExportFormatChange(value)}
          >
            <SelectTrigger className="w-20 sm:w-28 lg:w-36 flex-shrink-0 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generated">Generated Format</SelectItem>
              <SelectItem value="api">API Format</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDashboard}
            disabled={isSaving}
            className="gap-1 flex-shrink-0 text-xs sm:text-sm h-8 px-2 sm:px-3"
          >
            <span className="hidden sm:inline">{isDashboardActive ? 'Back to Builder' : 'My Forms'}</span>
            <span className="sm:hidden">{isDashboardActive ? 'Builder' : 'Forms'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            disabled={isSaving}
            className="gap-1 flex-shrink-0 h-8 px-2 sm:px-3"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs sm:text-sm">Preview</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onSaveForm}
            disabled={isSaving}
            className="gap-1 bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90 flex-shrink-0 h-8 px-2 sm:px-3 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="hidden sm:inline text-xs sm:text-sm">Saving...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs sm:text-sm">Save Form</span>
              </>
            )}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onNewForm}
            disabled={isSaving}
            className="gap-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 flex-shrink-0 h-8 px-2 sm:px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden md:inline text-xs sm:text-sm">Create Template</span>
            <span className="md:hidden hidden sm:inline text-xs">Create</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={isSaving}
            className="gap-1 flex-shrink-0 h-8 px-2 sm:px-3"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-xs sm:text-sm">Import</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportJSON}
            disabled={isSaving}
            className="gap-1 flex-shrink-0 h-8 px-2 sm:px-3"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-xs sm:text-sm">Export</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            className="gap-1 flex-shrink-0 h-8 px-2 sm:px-3"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden xl:inline text-xs sm:text-sm">Settings</span>
          </Button>
        </div>
      </div>

      {/* Template Information Row */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
        {/* Template Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-1.5 w-full">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 min-w-0 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEditName();
                }}
                autoFocus
                placeholder="Template name"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveName}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEditName}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 flex-1 min-w-0 group">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate flex-1 min-w-0">
                {formName || 'Untitled Template'}
              </h1>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                className="h-6 w-6 p-0 flex-shrink-0 ml-1 bg-gray-100 rounded-md"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Template Description */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {isEditingDescription ? (
            <div className="flex items-start gap-1.5 w-full">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="flex-1 min-w-0 text-sm resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                  if (e.key === 'Escape') handleCancelEditDescription();
                }}
                autoFocus
                placeholder="Template description"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveDescription}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEditDescription}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-1 flex-1 min-w-0 group">
              <FileText className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium line-clamp-2">
                  {formDescription || 'No description provided'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingDescription(true)}
                className="h-6 w-6 p-0 flex-shrink-0 ml-1 bg-gray-100 rounded-md"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Template Category */}
        <div className="flex items-center gap-2 min-w-0 lg:w-48">
          {isEditingCategory ? (
            <div className="flex items-center gap-1.5 w-full">
              <Select value={editCategory} onValueChange={(value: TemplateCategory) => setEditCategory(value)}>
                <SelectTrigger className="flex-1 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveCategory}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEditCategory}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Tag className="h-4 w-4 text-foreground flex-shrink-0" />
              <span className="text-sm text-foreground font-medium truncate flex-1 min-w-0">
                {formCategory ? formCategory.replace(/_/g, ' ') : 'No category'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingCategory(true)}
                className="h-6 w-6 p-0 flex-shrink-0 ml-1 bg-gray-100 rounded-md opacity-100"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};