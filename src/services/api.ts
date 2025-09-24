import axios from 'axios';

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.234.225.69:8888/api/admin'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the authentication token
apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface GenericApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

export interface User {
  email: string;
  token: string;
  name?: string; // Added optional name field
  role: string;
  merchantId: number;
  refreshToken: string;
}

interface LoginData {
  token: string;
  email: string;
  name?: string; // Added optional name field for LoginData
  role: string;
  merchantId: number;
  refreshToken: string;
}

export type LoginResponse = GenericApiResponse<LoginData>;

export interface Merchant {
  id: string;
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  website: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'CANCELLED';
  plan: string;
  revenue: string;
  joinDate: string;
  lastLogin: string;
  stripeCustomerId: string | null;
  trialEndDate: string | null;
  isTrialActive: boolean;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  datetimeFormat: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface MerchantListData {
  content: Merchant[];
  totalPages: number;
  totalElements: number;
  // ... other pagination fields if necessary
}

export type MerchantResponse = GenericApiResponse<MerchantListData>;

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/admin/auth/login', { email, password });
  return response.data;
};

export const getMerchants = async (
  status?: string,
  isTrialActive?: boolean,
  companyName?: string,
  page: number = 0,
  size: number = 10
): Promise<MerchantListData> => {
  try {
    const response = await apiClient.get<MerchantResponse>('/admin/merchants', {
      params: {
        ...(status && { status }),
        ...(isTrialActive !== undefined && { isTrialActive }),
        ...(companyName && { companyName }),
        page,
        size,
      },
    });
    return response.data.data; // This assumes your API response has a 'data' field containing the MerchantListData
  } catch (error) {
    console.error("Failed to fetch merchants from API, returning dummy data:", error);
    throw error;
  }
};

export const updateMerchantStatus = async (
  merchantId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'CANCELLED'
): Promise<void> => {
  const response = await apiClient.put<GenericApiResponse<any>>(`/admin/merchants/${merchantId}/status?status=${status.toUpperCase()}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to update merchant status.");
  }
};

export const updateMerchantDetails = async (merchantId: string, updatedDetails: Partial<Merchant>): Promise<Merchant> => {
  const response = await apiClient.put<GenericApiResponse<Merchant>>(`/merchants/${merchantId}`, updatedDetails);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to update merchant details.");
  }
  return response.data.data;
};

export const getMerchantDetails = async (merchantId: string): Promise<Merchant> => {
  try {
    const response = await apiClient.get<GenericApiResponse<Merchant>>(`/admin/merchants/${merchantId}`);
    return response.data.data; // This assumes your API response has a 'data' field containing the Merchant object
  } catch (error) {
    console.error("Failed to fetch merchant details from API, returning dummy data:", error);
    throw error;
  }
};

export interface PlanCreationResponseData {
  id: string;
  name: string;
  description: string;
  price: string;
  billingCycle: string;
  maxForms: string;
  maxLeadsPerMonth: string;
  maxLocations: string;
  features: string;
  // Add other properties that your backend returns for a created plan
}

export type PlanCreationResponse = GenericApiResponse<PlanCreationResponseData>;

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  maxForms: number;
  maxLeadsPerMonth: number;
  maxLocations: number;
  features: string; // Stored as stringified JSON
  createdAt: string;
  updatedAt: string;
}

export type AllPlansResponse = GenericApiResponse<Plan[]>;

export const createPlan = async (planData: any): Promise<PlanCreationResponse> => {
  const response = await apiClient.post<PlanCreationResponse>('/plans', planData);
  return response.data;
};

export const getAllPlans = async (): Promise<Plan[]> => {
  try {
    const response = await apiClient.get<AllPlansResponse>('/plans');
    return response.data.data; // Assuming 'data' field contains an array of plans
  } catch (error) {
    console.error("Failed to fetch all plans:", error);
    throw error;
  }
};

export const deletePlan = async (planId: string): Promise<GenericApiResponse<null>> => {
  try {
    const response = await apiClient.delete<GenericApiResponse<null>>(`/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete plan:", error);
    throw error;
  }
};
