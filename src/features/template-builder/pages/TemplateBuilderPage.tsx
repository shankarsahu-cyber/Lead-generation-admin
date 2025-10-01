import { useState, useEffect } from 'react';
import { FormData, FormStep, FormField, TreeNode, ExportFormat, APIFormData } from '../types/form-builder';
import { BuilderSidebar } from '../components/builder/BuilderSidebar';
import { BuilderHeader } from '../components/builder/BuilderHeader';
import { BuilderContent } from '../components/builder/BuilderContent';
import { PreviewModal } from '../components/builder/PreviewModal';
import { FormDashboard } from '../components/dashboard/FormDashboard';
import { Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getTemplateById, getAllForms } from '../services/api'; // Import the new API function

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
  const [allTemplates, setAllTemplates] = useState<FormData[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await getAllForms(toast);
        setAllTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Error fetching all templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates.",
          variant: "destructive",
        });
      }
    };
    fetchTemplates();
  }, [toast]);


  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
  };

  const handleSaveForm = async (formToSaveFromDashboard?: FormData) => {
    try {
      const currentFormData = formToSaveFromDashboard || formData; // Use passed formData or current state

      // Validate form data
      if (!currentFormData.name || currentFormData.name.trim() === '') {
        toast({
          title: "Save Failed",
          description: "Please provide a form name before saving.",
          variant: "destructive",
        });
        return;
      }

      if (!currentFormData.steps || currentFormData.steps.length === 0) {
        toast({
          title: "Save Failed",
          description: "Form must have at least one step to save.",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for saving
      const formToSave = {
        ...currentFormData,
        savedAt: new Date().toISOString(),
        ownerId: auth?.user?.id, // Include ownerId from auth prop
      };

      if (onSave) {
        await onSave(formToSave);
        toast({
          title: "Form Saved Successfully! 🎉",
          description: `Form "${currentFormData.name}" saved successfully via parent handler!`,
          variant: "success",
        });
        return;
      }

      // Fallback to localStorage if onSave is not provided
      if (typeof Storage === "undefined") {
        toast({
          title: "Save Failed",
          description: "Your browser doesn't support local storage and no save handler was provided.",
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
        console.warn('Error parsing existing saved forms, starting fresh:', parseError);
        savedForms = [];
      }

      const baseFormId = currentFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-') || 'untitled-form';
      let formId = baseFormId;
      let counter = 1;
      
      while (savedForms.some((form: any) => form.formId === formId)) {
        formId = `${baseFormId}-${counter}`;
        counter++;
      }

      const optimizedFormData = {
        ...formToSave,
        formId,
        // Remove any unnecessary data
        steps: formToSave.steps.map(step => ({
          ...step,
          fields: step.fields.map(field => {
            const optimizedField: any = { ...field };
            if (!optimizedField.description || optimizedField.description.trim() === '') {
              delete optimizedField.description;
            }
            if (!optimizedField.placeholder || optimizedField.placeholder.trim() === '') {
              delete optimizedField.placeholder;
            }
            if (optimizedField.required === false) {
              delete optimizedField.required;
            }
            if (!optimizedField.options || optimizedField.options.length === 0) {
              delete optimizedField.options;
            }
            return optimizedField;
          })
        }))
      };
      
      const existingFormIndex = savedForms.findIndex((form: any) => form.formId === formId);

      if (existingFormIndex > -1) {
        savedForms[existingFormIndex] = optimizedFormData;
      } else {
        savedForms.push(optimizedFormData);
      }

      let compressedData = compressFormData(savedForms);
      const dataSize = getDataSize(compressedData);
      const maxSize = 10 * 1024 * 1024; // 10MB limit to leave some buffer

      console.log(`Form data size: ${formatBytes(dataSize)}`);

      if (dataSize > maxSize) {
        if (savedForms.length > 1) {
          savedForms.sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
          
          let reducedForms = savedForms.slice(0, Math.max(1, Math.floor(savedForms.length * 0.7)));
          let reducedData = compressFormData(reducedForms);
          let reducedSize = getDataSize(reducedData);
          
          if (reducedSize <= maxSize) {
            toast({
              title: "Storage Optimized",
              description: `Removed ${savedForms.length - reducedForms.length} older forms to make space. Current size: ${formatBytes(reducedSize)}`,
              variant: "default",
            });
            savedForms = reducedForms;
            compressedData = reducedData;
          } else {
            toast({
              title: "Save Failed",
              description: `Form data is too large (${formatBytes(dataSize)}). Please reduce the form complexity or number of fields.`,
              variant: "destructive",
            });
            return;
          }
        } else {
          toast({
            title: "Save Failed",
            description: `Single form is too large (${formatBytes(dataSize)}). Please reduce the number of fields or complexity.`,
            variant: "destructive",
          });
          return;
        }
      }

      try {
        localStorage.setItem(localStorageKey, compressedData);
      } catch (saveError) {
        console.error('Error saving to localStorage:', saveError);
        if (saveError instanceof DOMException) {
          if (saveError.name === 'QuotaExceededError' || saveError.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            toast({
              title: "Save Failed",
              description: `Storage quota exceeded (${formatBytes(dataSize)}). Please clear browser data or reduce form size.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Save Failed",
              description: "Cannot access local storage. Please check your browser settings.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Save Failed",
            description: "Failed to save form data. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: existingFormIndex > -1 ? "Form Updated" : "Form Saved",
        description: `Form "${currentFormData.name}" ${existingFormIndex > -1 ? 'updated' : 'saved'} successfully! (${formatBytes(dataSize)})`,
        variant: "default",
      });

    } catch (error) {
      console.error('Save error:', error);
      
      if (error instanceof DOMException) {
        if (error.code === 22 || error.name === 'QuotaExceededError') {
          toast({
            title: "Save Failed",
            description: "Storage quota exceeded. Please clear some saved forms and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Save Failed",
            description: "Storage access denied. Please check your browser settings.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Save Failed",
          description: `There was an error saving your form: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
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
        formDescription={formData.description}
        formCategory={formData.category}
        onFormNameChange={(name) => setFormData({ ...formData, name })}
        onFormDescriptionChange={(description) => setFormData({ ...formData, description })}
        onFormCategoryChange={(category) => setFormData({ ...formData, category })}
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
            savedForms={allTemplates}
            onLoadForm={handleLoadForm}
            onDeleteForm={handleDeleteSavedForm}
            onNewForm={() => {
              setFormData(initialFormData);
              setSelectedStepId(initialFormData.steps[0].stepId);
              setSelectedFieldPath([]);
              setShowDashboard(false);
            }}
            onSaveTemplate={handleSaveForm} // Pass handleSaveForm here
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