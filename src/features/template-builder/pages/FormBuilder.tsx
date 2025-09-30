import { useState } from 'react';
import { FormData, FormStep, FormField, TreeNode, ExportFormat, APIFormData } from '../types/template-builder';
import { BuilderSidebar } from '../components/builder/BuilderSidebar';
import { BuilderHeader } from '../components/builder/BuilderHeader';
import { BuilderContent } from '../components/builder/BuilderContent';
import { PreviewModal } from '../components/builder/PreviewModal';
import { FormDashboard } from '../components/dashboard/FormDashboard';
import { useToast } from '../hooks/use-toast';
import { saveForm } from '../services/api'; // Import saveForm API

interface FormBuilderProps {
  auth?: { token?: string; user?: { id?: string } };
  onSave?: (template: any) => Promise<any> | void;
}

// Utility functions for data compression and optimization
const compressFormData = (data: any): string => {
  try {
    // Remove unnecessary whitespace and optimize the JSON
    const optimizedData = JSON.stringify(data, (key, value) => {
      // Remove empty arrays and null values to reduce size
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (value === null || value === undefined) return undefined;
      if (typeof value === 'string' && value.trim() === '') return undefined;
      return value;
    });
    
    // Simple compression by removing redundant characters
    return optimizedData
      .replace(/\s+/g, ' ')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
  } catch (error) {
    console.error('Compression error:', error);
    return JSON.stringify(data);
  }
};

const decompressFormData = (compressedData: string): any => {
  try {
    return JSON.parse(compressedData);
  } catch (error) {
    console.error('Decompression error:', error);
    return null;
  }
};

const getDataSize = (data: string): number => {
  return new Blob([data]).size;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const initialFormData: FormData = {
  name: "New Form",
  description: "Form description",
  steps: [
    {
      stepId: "step1",
      title: "Step 1",
      fields: []
    }
  ],
  settings: {
    successMessage: "Thank you for your submission!"
  }
};

const FormBuilder = ({ auth, onSave }: FormBuilderProps) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedStepId, setSelectedStepId] = useState<string>("step1");
  const [selectedFieldPath, setSelectedFieldPath] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [treeNodes, setTreeNodes] = useState<Map<string, TreeNode>>(new Map());
  const [exportFormat, setExportFormat] = useState<ExportFormat>('generated');
  const [showDashboard, setShowDashboard] = useState(false);
  const [builderSidebarOpen, setBuilderSidebarOpen] = useState(true); // New state for builder sidebar
  const { toast } = useToast();

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
  };

  const handleSaveForm = async () => {
    try {
      // Validate form data
      if (!formData.name || formData.name.trim() === '') {
        toast({
          title: "Save Failed",
          description: "Please provide a form name before saving.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.steps || formData.steps.length === 0) {
        toast({
          title: "Save Failed",
          description: "Form must have at least one step to save.",
          variant: "destructive",
        });
        return;
      }

      // Call the saveForm API
      await saveForm(formData, toast);
      
      toast({
        title: "Form Saved",
        description: `Form "${formData.name}" saved successfully to API!`,
        variant: "default",
      });

      // No need for localStorage fallback or parent onSave handler if API save is successful
    } catch (error) {
      console.error('Save error:', error);
        toast({
          title: "Save Failed",
          description: `There was an error saving your form: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
    }
  };

  const handleLoadForm = (formId: string) => {
    try {
      if (!formId) {
        toast({
          title: "Load Failed",
          description: "Invalid form ID provided.",
          variant: "destructive",
        });
        return;
      }

      if (typeof Storage === "undefined") {
        toast({
          title: "Load Failed",
          description: "Your browser doesn't support local storage.",
          variant: "destructive",
        });
        return;
      }

      let savedForms = [];
      const localStorageKey = auth?.user?.id ? `savedForms_${auth.user.id}` : 'savedForms';

      try {
        const existingData = localStorage.getItem(localStorageKey);
        if (existingData) {
          savedForms = decompressFormData(existingData) || [];
        }
        if (!Array.isArray(savedForms)) {
          savedForms = [];
        }
      } catch (parseError) {
        console.error('Error parsing saved forms:', parseError);
        toast({
          title: "Load Failed",
          description: "Saved forms data is corrupted. Please clear your browser data and try again.",
          variant: "destructive",
        });
        return;
      }

      const formToLoad = savedForms.find((form: any) => form.formId === formId && form.ownerId === auth?.user?.id);
      
      if (!formToLoad) {
        toast({
          title: "Load Failed",
          description: "Form not found or you don't have permission to load it.",
          variant: "destructive",
        });
        return;
      }

      if (!formToLoad.name || !formToLoad.steps || !Array.isArray(formToLoad.steps)) {
        toast({
          title: "Load Failed",
          description: "Invalid form structure. The form data may be corrupted.",
          variant: "destructive",
        });
        return;
      }

      const { formId: _, savedAt: __, ownerId: ___, ...loadedFormData } = formToLoad;
      setFormData(loadedFormData);
      setSelectedStepId(formToLoad.steps[0]?.stepId || '');
      setSelectedFieldPath([]);
      setShowDashboard(false);
      
      setTimeout(() => {
        setIsPreviewOpen(true);
      }, 500);
      
      toast({
        title: "Form Loaded",
        description: `Form "${formToLoad.name}" has been loaded and preview opened!`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Load error:', error);
      toast({
        title: "Load Failed",
        description: `There was an error loading the form: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavedForm = (formId: string) => {
    try {
      if (!formId) {
        toast({
          title: "Delete Failed",
          description: "Invalid form ID provided.",
          variant: "destructive",
        });
        return;
      }

      if (typeof Storage === "undefined") {
        toast({
          title: "Delete Failed",
          description: "Your browser doesn't support local storage.",
          variant: "destructive",
        });
        return;
      }

      let savedForms = [];
      const localStorageKey = auth?.user?.id ? `savedForms_${auth.user.id}` : 'savedForms';

      try {
        const existingData = localStorage.getItem(localStorageKey);
        if (existingData) {
          savedForms = decompressFormData(existingData) || [];
        }
        if (!Array.isArray(savedForms)) {
          savedForms = [];
        }
      } catch (parseError) {
        console.error('Error parsing saved forms:', parseError);
        toast({
          title: "Delete Failed",
          description: "Saved forms data is corrupted. Please clear your browser data and try again.",
          variant: "destructive",
        });
        return;
      }

      const updatedForms = savedForms.filter((form: any) => form.formId !== formId || form.ownerId !== auth?.user?.id);
      
      if (updatedForms.length === savedForms.length) {
        toast({
          title: "Delete Failed",
          description: "Form not found or you don't have permission to delete it.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const compressedData = compressFormData(updatedForms);
        localStorage.setItem(localStorageKey, compressedData);
      } catch (saveError) {
        console.error('Error saving updated forms:', saveError);
        toast({
          title: "Delete Failed",
          description: "Could not save changes. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Form Deleted",
        description: `Form has been deleted successfully!`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: `There was an error deleting the form: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleStepTitleChange = (stepId: string, newTitle: string) => {
    setFormData(prevData => ({
      ...prevData,
      steps: prevData.steps.map(step =>
        step.stepId === stepId ? { ...step, title: newTitle } : step
      ),
    }));
  };

  const handleDeleteStep = (stepIdToDelete: string) => {
    setFormData(prevData => {
      const updatedSteps = prevData.steps.filter(step => step.stepId !== stepIdToDelete);
      let newSelectedStepId = selectedStepId;
      let newSelectedFieldPath = selectedFieldPath;

      if (selectedStepId === stepIdToDelete) {
        if (updatedSteps.length > 0) {
          newSelectedStepId = updatedSteps[0].stepId;
          newSelectedFieldPath = []; // Clear field selection when step changes
        } else {
          newSelectedStepId = ''; // No steps left, clear selection
          newSelectedFieldPath = [];
        }
      }

      setSelectedStepId(newSelectedStepId);
      setSelectedFieldPath(newSelectedFieldPath);
      return { ...prevData, steps: updatedSteps };
    });
  };

  const handleImportJSON = (jsonData: FormData | APIFormData) => {
    if ('formPayload' in jsonData) {
      // API format
      try {
        const parsedPayload = JSON.parse(jsonData.formPayload);
        setFormData(parsedPayload);
        if (parsedPayload.steps.length > 0) {
          setSelectedStepId(parsedPayload.steps[0].stepId);
        }
      } catch (error) {
        console.error('Invalid formPayload JSON:', error);
      }
    } else {
      // Generated format
      setFormData(jsonData);
      if (jsonData.steps.length > 0) {
        setSelectedStepId(jsonData.steps[0].stepId);
      }
    }
  };

  const handleExportJSON = () => {
    let jsonString: string;
    let filename: string;

    if (exportFormat === 'api') {
      const apiData: APIFormData = {
        name: formData.name,
        description: formData.description,
        category: "GENERAL",
        formPayload: JSON.stringify(formData),
        isActive: true
      };
      jsonString = JSON.stringify(apiData, null, 2);
      filename = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-api.json`;
    } else if (exportFormat === 'template') {
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: "GENERAL", // Default category, can be made dynamic if needed
        formPayload: {
          formId: formData.name.toLowerCase().replace(/\s+/g, '-'),
          name: formData.name,
          description: formData.description,
          theme: formData.theme || {
            primaryColor: "#4F46E5",
            secondaryColor: "#8B5CF6",
            backgroundColor: "#F9FAFB",
            textColor: "#1F2937",
            borderColor: "#D1D5DB",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
            buttonColor: "#4F46E5",
            buttonTextColor: "#FFFFFF"
          },
          steps: formData.steps.map(step => ({
            stepId: step.stepId,
            title: step.title,
            description: step.description || "",
            fields: step.fields.map(field => ({
              fieldId: field.fieldId,
              type: field.type,
              label: field.label,
              placeholder: (field as any).placeholder || "", // Cast to any to access placeholder
              required: field.required,
              order: 0 // Assuming order is not explicitly managed in form-data
            })),
            nextStepCondition: null, // Assuming no complex conditions for template
            isLastStep: step.isLastStep || false
          })),
          settings: formData.settings || {
            allowMultipleSubmissions: false,
            requireEmailVerification: false,
            successMessage: "Thank you for your submission!",
            redirectUrl: null,
            showProgressBar: true,
            enableAnalytics: true,
            submitButtonText: "Submit Form"
          }
        },
        isActive: true
      };
      jsonString = JSON.stringify(templateData, null, 2);
      filename = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-template.json`;
    } else {
      jsonString = JSON.stringify(formData, null, 2);
      jsonString = `Generated form data: ${jsonString}`;
      filename = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-form.json`;
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedStep = formData.steps.find(step => step.stepId === selectedStepId);

  return (
    <div className="h-screen flex flex-col bg-background">
      <BuilderHeader
        formName={formData.name}
        onFormNameChange={(name) => setFormData({ ...formData, name })}
        onImportJSON={handleImportJSON}
        onExportJSON={handleExportJSON}
        onPreview={() => setIsPreviewOpen(true)}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onSaveForm={handleSaveForm}
        onToggleDashboard={() => setShowDashboard(prev => !prev)}
        isDashboardActive={showDashboard}
        onToggleBuilderSidebar={() => setBuilderSidebarOpen(prev => !prev)} // Pass toggle function
        isBuilderSidebarOpen={builderSidebarOpen} // Pass sidebar state
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {showDashboard ? (
          <FormDashboard 
            savedForms={(() => {
              try {
                const existingData = localStorage.getItem('savedForms');
                return existingData ? decompressFormData(existingData) || [] : [];
              } catch (error) {
                console.error('Error loading saved forms for dashboard:', error);
                return [];
              }
            })()}
            onLoadForm={handleLoadForm}
            onDeleteForm={handleDeleteSavedForm}
            onNewForm={() => {
              setFormData(initialFormData);
              setSelectedStepId(initialFormData.steps[0].stepId);
              setSelectedFieldPath([]);
              setShowDashboard(false);
            }}
          />
        ) : (
          <>
            {builderSidebarOpen && (
            <BuilderSidebar
              formData={formData}
              selectedStepId={selectedStepId}
              selectedFieldPath={selectedFieldPath}
              onStepSelect={setSelectedStepId}
              onFieldSelect={setSelectedFieldPath}
              onFormDataChange={handleFormDataChange}
              treeNodes={treeNodes}
              onTreeNodesChange={setTreeNodes}
                onDeleteStep={handleDeleteStep}
                onStepTitleChange={handleStepTitleChange}
                isOpen={builderSidebarOpen} // Pass isOpen prop
            />
            )}
            
            <BuilderContent
              step={selectedStep}
              formData={formData}
              selectedFieldPath={selectedFieldPath}
              onFormDataChange={handleFormDataChange}
              onFieldSelect={setSelectedFieldPath}
              onStepSelect={setSelectedStepId}
            />
          </>
        )}
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formData={formData}
      />
    </div>
  );
};

export default FormBuilder;