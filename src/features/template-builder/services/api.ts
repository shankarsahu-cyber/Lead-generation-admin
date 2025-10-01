// import axios from 'axios'; // Import axios
// import { useToast } from '../../hooks/use-toast'; // Assuming useToast is needed here or will be passed
import { apiClient } from '../../../services/api'; // Import apiClient

// const API_BASE_URL = 'http://13.234.225.69:8888/api/admin';

interface ToastFunctionProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | null | undefined;
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
        title: "Upload Successful! 📸",
        description: "Image uploaded successfully.",
        variant: "success",
      });
      return response.data; // Directly return the string URL
    } else if (response.data && response.data.url) {
      toast({
        title: "Upload Successful! 📸",
        description: "Image uploaded successfully.",
        variant: "success",
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

interface UpdateTemplateResponse {
  success: boolean;
  message: string;
  templateId?: string;
}

export const updateTemplate = async (templateId: number, formData: FormData, toast: (props: ToastFunctionProps) => void): Promise<UpdateTemplateResponse> => {
  toast({
    title: "Updating template...",
    description: "Please wait while your template is being updated.",
  });

  try {
    // Validate category and convert to numeric ID
    const validCategory = TEMPLATE_CATEGORIES.includes(formData.category as TemplateCategory) 
      ? formData.category as TemplateCategory 
      : 'GENERIC';
    
    const categoryId = getCategoryId(validCategory);

    const apiFormData: APIFormData = {
      name: formData.name,
      description: formData.description,
      category: categoryId, // Use numeric category ID
      formPayload: JSON.stringify(formData),
      isActive: true,
      id: templateId
    };

    const response = await apiClient.put<UpdateTemplateResponse>(`/admin/templates/${templateId}`, apiFormData);

    // Check for successful HTTP status codes (200-299)
    if (response.status >= 200 && response.status < 300) {
      toast({
        title: "Template Updated Successfully! ✅",
        description: response.data.message || "Your template has been updated.",
        variant: "success",
      });
      // Return success response regardless of response.data.success field
      return {
        success: true,
        message: response.data.message || "Template updated successfully",
        templateId: response.data.templateId
      };
    } else {
      toast({
        title: "Update Failed",
        description: response.data.message || "There was an error updating your template.",
        variant: "destructive",
      });
      throw new Error(response.data.message || "Failed to update template");
    }
  } catch (error) {
    console.error('Template update failed:', error);
    toast({
      title: "Update Failed",
      description: "There was an error updating your template.",
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
  category: number; // Changed to number for backend compatibility
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

// Category mapping from string to numeric ID for backend API (0-based indices)
export const CATEGORY_ID_MAPPING: Record<TemplateCategory, number> = {
  "REAL_ESTATE": 0,
  "EDUCATION": 1,
  "INSURANCE": 2,
  "HEALTHCARE": 3,
  "FINANCE": 4,
  "ECOMMERCE": 5,
  "EVENTS": 6,
  "TRAVEL": 7,
  "RESTAURANT": 8,
  "AUTOMOBILE": 9,
  "BEAUTY_WELLNESS": 10,
  "LEGAL": 11,
  "CONSTRUCTION": 12,
  "NON_PROFIT": 13,
  "TECHNOLOGY": 14,
  "HOSPITAL": 15,
  "GENERIC": 16
};

// Helper function to get category ID from category string
export const getCategoryId = (category: TemplateCategory): number => {
  return CATEGORY_ID_MAPPING[category] || CATEGORY_ID_MAPPING["GENERIC"];
};

// Reverse mapping from numeric ID to category string (0-based indices)
export const ID_CATEGORY_MAPPING: Record<number, TemplateCategory> = {
  0: "REAL_ESTATE",
  1: "EDUCATION", 
  2: "INSURANCE",
  3: "HEALTHCARE",
  4: "FINANCE",
  5: "ECOMMERCE",
  6: "EVENTS",
  7: "TRAVEL",
  8: "RESTAURANT",
  9: "AUTOMOBILE",
  10: "BEAUTY_WELLNESS",
  11: "LEGAL",
  12: "CONSTRUCTION",
  13: "NON_PROFIT",
  14: "TECHNOLOGY",
  15: "HOSPITAL",
  16: "GENERIC"
};

// Helper function to get category string from numeric ID
export const getCategoryFromId = (categoryId: number): TemplateCategory => {
  return ID_CATEGORY_MAPPING[categoryId] || "GENERIC";
};

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
        title: "Form Saved Successfully! 💾",
        description: response.data.message || "Your form has been saved.",
        variant: "success",
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
  console.log('🔥 saveTemplate function called with:', formData);
  
  const isUpdate = formData.id !== undefined && formData.id !== null;
  const endpoint = isUpdate ? `/admin/templates/${formData.id}` : `/admin/templates`; // Use formData.id (number)
  const method = isUpdate ? apiClient.put : apiClient.post;

  console.log('📡 API endpoint:', endpoint);
  console.log('🔧 HTTP method:', isUpdate ? 'PUT' : 'POST');

  // Ensure category is valid, default to GENERIC if missing or invalid
  const validCategory = formData.category && TEMPLATE_CATEGORIES.includes(formData.category as any) 
    ? formData.category 
    : 'GENERIC' as TemplateCategory;

  console.log('📂 Valid category:', validCategory);

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

    const categoryId = getCategoryId(validCategory);

    const apiFormData: APIFormData = {
      name: formData.name,
      description: formData.description,
      category: categoryId, // Use numeric category ID
      formPayload: JSON.stringify(innerFormPayload), // Stringify the constructed object
      isActive: true, // Default to active
    };

    console.log('📤 Sending API request with data:', apiFormData);
    const response = await method<any>(endpoint, apiFormData);
    console.log('📥 API response received:', response.data);

    // Check if response is successful (status 200-299 and has data)
    if (response.status >= 200 && response.status < 300 && response.data) {
      console.log('✅ API call successful, showing success toast');
      toast({
        title: "Form Saved Successfully!",
        description: `Form "${formData.name}" has been saved successfully!`,
        variant: "success",
      });
      console.log('🎉 Success toast called');
      
      // Return a success response format
      return {
        success: true,
        message: "Form saved successfully",
        templateId: response.data.id?.toString()
      };
    } else {
      console.error("❌ API response indicated failure:", response.data);
      toast({
        title: "Save Failed",
        description: response.data?.message || "There was an error saving your form.",
        variant: "destructive",
      });
      throw new Error(response.data?.message || "Failed to save form");
    }
  } catch (error: any) {
    console.error('❌ Form save failed:', error);
    
    // Check if it's an HTTP error with response data
    if (error.response && error.response.data) {
      console.error('❌ HTTP Error Response:', error.response.data);
      toast({
        title: "Save Failed",
        description: error.response.data.message || `Server error: ${error.response.status}`,
        variant: "destructive",
      });
    } else if (error.message && !error.message.includes('API response indicated failure')) {
      console.log('🚨 Showing error toast for network/other error');
      toast({
        title: "Save Failed",
        description: "There was an error saving your form. Please check your connection and try again.",
        variant: "destructive",
      });
    }
    throw error;
  }
};

export const getAllForms = async (toast: (props: ToastFunctionProps) => void, category?: TemplateCategory): Promise<FormData[]> => {
  try {
    const response = await apiClient.get<AllTemplatesResponse>(`/admin/templates`, {
      params: {
        ...(category && { category: getCategoryId(category) }), // Send numeric category ID
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
          category: getCategoryFromId(apiForm.category), // Convert numeric category ID to string
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
  // Removed initial toast to prevent duplicate popups
  
  try {
    const response = await apiClient.delete(`/admin/templates/${templateId}`); // Use templateId (number)
    
    console.log('Delete API Response:', response);
    console.log('Delete API Response Data:', response.data);
    console.log('Delete API Response Status:', response.status);

    // Handle different response scenarios
    if (response.status === 200 || response.status === 204) {
      // Success - either with data or no content
      if (response.data && typeof response.data === 'object' && response.data.success !== undefined) {
        // Response has success field
        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || "Failed to delete template");
        }
      } else {
        // No data or simple success response
        return { success: true, message: "Template deleted successfully" };
      }
    } else {
      throw new Error(`HTTP ${response.status}: Failed to delete template`);
    }
  } catch (error) {
    console.error('Template delete failed:', error); // Changed from form
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // Don't show toast here, let the calling function handle error toast
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
