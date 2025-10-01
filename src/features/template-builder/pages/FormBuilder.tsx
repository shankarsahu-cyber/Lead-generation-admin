import { useState } from 'react';
import { FormData, FormStep, FormField, TreeNode, ExportFormat, APIFormData } from '../types/template-builder';
import { BuilderSidebar } from '../components/builder/BuilderSidebar';
import { BuilderHeader } from '../components/builder/BuilderHeader';
import { BuilderContent } from '../components/builder/BuilderContent';
import { PreviewModal } from '../components/builder/PreviewModal';
import MyForms from './MyForms'; // Import MyForms component
import { useToast } from '../hooks/use-toast';
import { saveForm } from '../services/api'; // Import saveForm API
import { getAllForms, deleteForm } from '../services/api'; // Import getAllForms and deleteForm API
import { saveTemplate, TemplateCategory } from '../services/api'; // Import saveTemplate API and TemplateCategory
import { CreateNewTemplateModal } from '../components/builder/CreateNewTemplateModal'; // Import the new modal

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
  const [showDashboard, setShowDashboard] = useState(true); // Changed to true to make MyForms the landing page
  const [builderSidebarOpen, setBuilderSidebarOpen] = useState(true); // New state for builder sidebar
  const [refreshDashboard, setRefreshDashboard] = useState(0); // New state to trigger dashboard refresh
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Changed to false to not open modal initially
  const { toast } = useToast();

  const isFormDetailsComplete = (
    formData.name.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.category !== undefined && formData.category.trim() !== ''
  );

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

      // Call the saveTemplate API
      await saveTemplate(formData, toast);
      
      toast({
        title: "Template Saved",
        description: `Template "${formData.name}" created successfully!`, // Changed from Form Saved
        variant: "default",
      });
      setRefreshDashboard(prev => prev + 1); // Trigger dashboard refresh

      // No need for localStorage fallback or parent onSave handler if API save is successful
    } catch (error) {
      console.error('Save error:', error);
        toast({
          title: "Save Failed",
          description: `There was an error saving your template: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
    }
  };

  const handleLoadForm = async (formId: string) => {
    try {
      if (!formId) {
        toast({
          title: "Load Failed",
          description: "Invalid form ID provided.",
          variant: "destructive",
        });
        return;
      }

      const allForms = await getAllForms(toast);
      const formToLoad = allForms.find(form => String(form.formId) === formId); // Use String(form.formId) for comparison

      if (!formToLoad) {
        toast({
          title: "Load Failed",
          description: "Form not found.",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        ...formToLoad,
        id: formToLoad.formId // Set the id when loading the form
      });
      setSelectedStepId(formToLoad.steps[0]?.stepId || '');
      setSelectedFieldPath([]);
      setShowDashboard(false);
      
      toast({
        title: "Form Loaded",
        description: `Form "${formToLoad.name}" has been loaded!`, 
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

  const handleCreateNewTemplate = (name: string, description: string, category: TemplateCategory) => {
    setFormData({
      ...initialFormData,
      name,
      description,
      category, // Set the category here
      // Optionally, if you want to set a default first step title based on category:
      steps: [{
        stepId: "step1",
        title: `Your First Step (${category.replace(/_/g, ' ')})`,
        fields: []
      }]
    });
    setSelectedStepId(initialFormData.steps[0].stepId);
    setSelectedFieldPath([]);
    setShowDashboard(false); // Go back to builder view
    setIsCreateModalOpen(false);
  };

  const handleDeleteSavedForm = async (formId: string) => {
    try {
      if (!formId) {
        toast({
          title: "Delete Failed",
          description: "Invalid form ID provided.",
          variant: "destructive",
        });
        return;
      }

      await deleteForm(formId, toast);
      
      toast({
        title: "Form Deleted",
        description: `Form has been deleted successfully!`,
        variant: "default",
      });
      console.log("Template deleted successfully, triggering dashboard refresh.");
      setRefreshDashboard(prev => prev + 1); // Trigger dashboard refresh
      // After deleting, trigger a refresh of the forms list in MyForms component.
      // This will be handled by MyForms component's useEffect which fetches forms on mount.

    } catch (error) {
      console.error('Delete error in handleDeleteSavedForm:', error);
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
        onNewForm={() => {
          setIsCreateModalOpen(true); // Open the new template creation modal
          // When creating a new form, ensure formData is reset and id is cleared
          setFormData({
            ...initialFormData,
            id: undefined,
            name: '',
            description: '',
            category: ''
          });
          setSelectedStepId(initialFormData.steps[0].stepId);
          setSelectedFieldPath([]);
          setShowDashboard(false); // Go back to builder view
        }}
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {showDashboard ? (
          <MyForms 
            onLoadForm={handleLoadForm}
            onPreviewForm={(formToPreview: FormData) => {
              setFormData(formToPreview);
              setSelectedStepId(formToPreview.steps[0]?.stepId || '');
              setSelectedFieldPath([]);
              setIsPreviewOpen(true);
            }}
            onNewForm={() => {
              setIsCreateModalOpen(true); // Open the new template creation modal
            }}
            refreshTrigger={refreshDashboard} // Pass refresh trigger to MyForms
            onDeleteForm={handleDeleteSavedForm} // Pass delete function to MyForms
          />
        ) : (
          <>
            {isFormDetailsComplete ? (
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
                    isFormDetailsComplete={isFormDetailsComplete} // Pass the new prop
                  />
                )}
                
                <BuilderContent
                  step={selectedStep}
                  formData={formData}
                  selectedFieldPath={selectedFieldPath}
                  onFormDataChange={handleFormDataChange}
                  onFieldSelect={setSelectedFieldPath}
                  onStepSelect={setSelectedStepId}
                  isFormDetailsComplete={isFormDetailsComplete} // Pass the new prop
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
                Please provide a Form Name, Description, and Category to start building your template.
              </div>
            )}
          </>
        )}
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formData={formData}
        onSaveForm={handleSaveForm} // Pass handleSaveForm to PreviewModal
      />

      <CreateNewTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateNewTemplate}
      />
    </div>
  );
};

export default FormBuilder;