// import axios from 'axios'; // Import axios
// import { useToast } from '../../hooks/use-toast'; // Assuming useToast is needed here or will be passed
import { apiClient } from '../../../services/api'; // Import apiClient

// const API_BASE_URL = 'http://13.234.225.69:8888/api/admin';

interface ToastFunctionProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | null | undefined;
}

export const uploadImage = async (file: File, toast: (props: ToastFunctionProps) => void) => {
  // const { toast } = useToast(); // This might be an issue if not called within a React component

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    toast({
      title: "File too large",
      description: "Please select an image under 5MB",
      variant: "destructive",
    });
    throw new Error("File too large");
  }

  const formData = new FormData();
  formData.append('file', file);

  toast({
    title: "Uploading image...",
    description: "Please wait while your image is being uploaded.",
  });

  try {
    // const storedUser = localStorage.getItem('user');
    // const user = storedUser ? JSON.parse(storedUser) : null;
    // const token = user?.token;

    const response = await apiClient.post(
      `/uploads/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );

    if (typeof response.data === 'string') {
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully.",
      });
      return response.data; // Directly return the string URL
    } else if (response.data && response.data.url) {
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully.",
      });
      return response.data.url;
    } else {
      // console.error("API response did not contain 'url' field:", response.data);
      toast({
        title: "Upload Failed",
        description: "No URL returned from API.",
        variant: "destructive",
      });
      throw new Error("No URL returned from API");
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    toast({
      title: "Upload Failed",
      description: "There was an error uploading your image.",
      variant: "destructive",
    });
    throw error;
  }
};

// Import types needed for saveForm
import type { FormData } from '../types/template-builder';

interface APIFormData {
  name: string;
  description: string;
  category: string;
  formPayload: string;
  isActive: boolean;
  id?: number; // Add optional id field
}

export const TEMPLATE_CATEGORIES = [
  "REAL_ESTATE", "EDUCATION", "INSURANCE", "HEALTHCARE", "FINANCE", "ECOMMERCE",
  "EVENTS", "TRAVEL", "RESTAURANT", "AUTOMOBILE", "BEAUTY_WELLNESS", "LEGAL",
  "CONSTRUCTION", "NON_PROFIT", "TECHNOLOGY", "HOSPITAL", "GENERIC"
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

interface SaveFormResponse {
  success: boolean;
  message: string;
  formId?: string;
}

export const saveForm = async (formData: FormData, toast: (props: ToastFunctionProps) => void): Promise<SaveFormResponse> => {
  toast({
    title: "Saving form...",
    description: "Please wait while your form is being saved.",
  });

  try {
    const apiFormData: APIFormData = {
      name: formData.name,
      description: formData.description,
      category: "General", // Default category, could be made dynamic later
      formPayload: JSON.stringify({ steps: formData.steps, settings: formData.settings, theme: formData.theme }),
      isActive: true, // Default to active
    };

    const response = await apiClient.post<SaveFormResponse>(`/admin/templates`, apiFormData);

    if (response.data.success) {
      toast({
        title: "Form Saved Successfully",
        description: response.data.message || "Your form has been saved.",
      });
      return response.data;
    } else {
      toast({
        title: "Save Failed",
        description: response.data.message || "There was an error saving your form.",
        variant: "destructive",
      });
      throw new Error(response.data.message || "Failed to save form");
    }
  } catch (error) {
    console.error('Form save failed:', error);
    toast({
      title: "Save Failed",
      description: "There was an error saving your form.",
      variant: "destructive",
    });
    throw error;
  }
};

interface AllTemplatesResponse extends Array<APIFormData> {}

interface CreateTemplateResponse {
  success: boolean;
  message: string;
  templateId?: string; // Add templateId to response
}

export const saveTemplate = async (formData: FormData, toast: (props: ToastFunctionProps) => void): Promise<CreateTemplateResponse> => {
  const isUpdate = formData.id !== undefined && formData.id !== null;
  const endpoint = isUpdate ? `/admin/templates/${formData.id}` : `/admin/templates`; // Use formData.id (number)
  const method = isUpdate ? apiClient.put : apiClient.post;

  toast({
    title: isUpdate ? "Updating template..." : "Creating template...",
    description: isUpdate ? "Please wait while your template is being updated." : "Please wait while your template is being created.",
  });

  try {
    // Construct the inner formPayload object first
    const innerFormPayload = {
      formId: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-'), // Derive formId from name
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
      steps: formData.steps,
      settings: formData.settings,
    };

    const apiFormData: APIFormData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      formPayload: JSON.stringify(innerFormPayload), // Stringify the constructed object
      isActive: true, // Default to active
    };

    const response = await method<CreateTemplateResponse>(endpoint, apiFormData);

    if (response.data.success) {
      toast({
        title: isUpdate ? "Template Updated Successfully" : "Template Created Successfully",
        description: response.data.message || (isUpdate ? "Your template has been updated." : "Your template has been created."),
      });
      return response.data;
    } else {
      console.error(isUpdate ? "API response indicated failure for updateTemplate:" : "API response indicated failure for createTemplate:", response.data);
      toast({
        title: isUpdate ? "Template Update Failed" : "Template Creation Failed",
        description: response.data.message || (isUpdate ? "There was an error updating your template." : "There was an error creating your template."),
        variant: "destructive",
      });
      throw new Error(response.data.message || (isUpdate ? "Failed to update template" : "Failed to create template"));
    }
  } catch (error) {
    console.error(isUpdate ? 'Template update failed:' : 'Template creation failed:', error);
    toast({
      title: isUpdate ? "Template Update Failed" : "Template Creation Failed",
      description: "There was an error saving your template.", // Generic message for both create/update
      variant: "destructive",
    });
    throw error;
  }
};

export const getAllForms = async (toast: (props: ToastFunctionProps) => void, category?: TemplateCategory): Promise<FormData[]> => {
  try {
    const response = await apiClient.get<AllTemplatesResponse>(`/admin/templates`, {
      params: {
        ...(category && { category }),
      },
    });

    const parsedTemplates: FormData[] = response.data.map(apiForm => {
      try {
        const formPayload = JSON.parse(apiForm.formPayload);
        return {
          ...formPayload,
          id: apiForm.id, // Assign backend's numerical ID
          name: apiForm.name,
          description: apiForm.description,
          formId: (formPayload as any).formId || String(apiForm.id) || apiForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') // Ensure formId is a string
        };
      } catch (parseError) {
        console.error('Error parsing templatePayload for template:', apiForm.name, parseError);
        toast({
          title: 'Data Error',
          description: `Could not parse template data for "${apiForm.name}".`,
          variant: 'destructive',
        });
        return null;
      }
    }).filter(template => template !== null) as FormData[];

    return parsedTemplates;
  } catch (error) {
    console.error('Template fetch failed (catch block):', error);
    toast({
      title: "Fetch Failed",
      description: "There was an error fetching your templates.",
      variant: "destructive",
    });
    throw error;
  }
};

interface DeleteFormResponse {
  success: boolean;
  message: string;
}

export const deleteForm = async (templateId: number, toast: (props: ToastFunctionProps) => void): Promise<DeleteFormResponse> => {
  toast({
    title: "Deleting template...", // Changed from form
    description: "Please wait while your template is being deleted.", // Changed from form
  });

  try {
    const response = await apiClient.delete<DeleteFormResponse>(`/admin/templates/${templateId}`); // Use templateId (number)

    if (response.data.success) {
      toast({
        title: "Template Deleted Successfully", // Changed from Form Deleted
        description: response.data.message || "Your template has been deleted.", // Changed from form
      });
      return response.data;
    } else {
      toast({
        title: "Delete Failed",
        description: response.data.message || "There was an error deleting your template.", // Changed from form
        variant: "destructive",
      });
      throw new Error(response.data.message || "Failed to delete template"); // Changed from form
    }
  } catch (error) {
    console.error('Template delete failed:', error); // Changed from form
    toast({
      title: "Delete Failed",
      description: "There was an error deleting your template.", // Changed from form
      variant: "destructive",
    });
    throw error;
  }
};

interface GetTemplateResponse {
  success: boolean;
  message: string;
  data: APIFormData; // Assuming APIFormData is the structure for a single template
}

export const getTemplateById = async (templateId: number, toast: (props: ToastFunctionProps) => void): Promise<APIFormData> => {
  toast({
    title: "Loading template...",
    description: "Please wait while your template is being loaded.",
  });

  try {
    const response = await apiClient.get<GetTemplateResponse>(`/admin/templates/${templateId}`);

    if (response.data.success) {
      toast({
        title: "Template Loaded Successfully",
        description: response.data.message || "Your template has been loaded.",
      });
      return response.data.data;
    } else {
      toast({
        title: "Load Failed",
        description: response.data.message || "There was an error loading your template.",
        variant: "destructive",
      });
      throw new Error(response.data.message || "Failed to load template");
    }
  } catch (error) {
    console.error('Template load failed:', error);
    toast({
      title: "Load Failed",
      description: "There was an error loading your template.",
      variant: "destructive",
    });
    throw error;
  }
};
