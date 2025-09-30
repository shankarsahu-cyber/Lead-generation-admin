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
import type { FormData, APIFormData } from '../types/template-builder';

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

    const response = await apiClient.post<SaveFormResponse>(`/forms`, apiFormData);

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
