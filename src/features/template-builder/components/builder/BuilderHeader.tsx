import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FormData, APIFormData, ExportFormat } from '../../types/form-builder';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Menu
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface BuilderHeaderProps {
  formName: string;
  onFormNameChange: (name: string) => void;
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
}

export const BuilderHeader = ({
  formName,
  onFormNameChange,
  onImportJSON,
  onExportJSON,
  onPreview,
  onSaveForm, // Destructure onSaveForm prop
  exportFormat,
  onExportFormatChange,
  onToggleDashboard,
  isDashboardActive,
  onToggleBuilderSidebar, // Destructure new prop
  isBuilderSidebarOpen // Destructure new prop
}: BuilderHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(formName);
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
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(formName);
    setIsEditing(false);
  };

  return (
    <header className="h-16 border-b bg-card flex items-center gap-4 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4 pl-4 md:pl-6">
        {/* Toggle Builder Sidebar button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleBuilderSidebar}
          className="md:hidden"
        >
          {isBuilderSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-32 sm:w-48"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveName}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{formName}</h1>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end min-w-0 pr-4 md:pr-6">
        <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-2 md:pb-0 min-w-0">
          <Select
            value={exportFormat}
            onValueChange={(value: ExportFormat) => onExportFormatChange(value)}
          >
            <SelectTrigger className="w-32 sm:w-40">
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
            className="gap-2"
          >
            {isDashboardActive ? 'Back to Builder' : 'My Forms'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onSaveForm}
            className="gap-2 bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Save Form
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportJSON}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          {/* "Manage Subscription" and "New Item" buttons removed */}
        </div>
      </div>
    </header>
  );
};