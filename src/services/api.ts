import axios from 'axios';

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.234.225.69:8888/api/admin'; 

export const apiClient = axios.create({
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

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Refresh token on 401 (Unauthorized) or 403 (Forbidden)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const refreshUrl = 'http://13.234.225.69:8888/api/auth/refresh';
          // Debug log
          console.log('Attempting token refresh with refreshToken:', user.refreshToken);
          const refreshResponse = await axios.post(refreshUrl, {
            refreshToken: user.refreshToken,
          });
          // The token is inside refreshResponse.data.data.token
          if (refreshResponse.data && refreshResponse.data.data && refreshResponse.data.data.token) {
            // Update token in localStorage
            user.token = refreshResponse.data.data.token;
            localStorage.setItem('user', JSON.stringify(user));
            // Update Authorization header and retry original request
            originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.data.token}`;
            // Also update default header for future requests
            apiClient.defaults.headers['Authorization'] = `Bearer ${refreshResponse.data.data.token}`;
            console.log('Token refreshed successfully. Retrying original request.');
            return apiClient(originalRequest);
          } else if (
            refreshResponse.data &&
            refreshResponse.data.error &&
            typeof refreshResponse.data.error === 'string' &&
            refreshResponse.data.error.toLowerCase().includes('invalid refresh token')
          ) {
            // If refresh token is invalid, logout user and redirect
            console.error('Invalid refresh token, logging out.');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(new Error('Invalid refresh token'));
          } else {
            console.error('Refresh API did not return a new token:', refreshResponse.data);
          }
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
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
  activePlanName?: string; // Add new optional property for the active plan name
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
    const response = await apiClient.get<MerchantResponse>('/merchants', {
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
  const response = await apiClient.put<GenericApiResponse<any>>(`/merchants/${merchantId}/status?status=${status.toUpperCase()}`);
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
    const response = await apiClient.get<GenericApiResponse<Merchant>>(`/merchants/${merchantId}`);
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
  billingCycle: 'MONTHLY' | 'YEARLY' | 'ADDON'; // Changed 'ADDONS' to 'ADDON'
  maxForms: number;
  maxLeadsPerMonth: number;
  maxLocations: number;
  features: string; // Stored as stringified JSON
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  planName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'ADDON';
  nextBillingDate: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export type MerchantSubscriptionsResponse = GenericApiResponse<Subscription[]>;

export type AllPlansResponse = GenericApiResponse<Plan[]>;

export const createPlan = async (planData: any): Promise<PlanCreationResponse> => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token;

    // Construct the full URL to bypass the apiClient's /admin base URL for this specific endpoint
    const fullUrl = `${apiClient.defaults.baseURL?.replace('/admin', '')}/plans`;

    const response = await axios.post<PlanCreationResponse>(fullUrl, planData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create plan:", error);
    throw error;
  }
};

export const getAllPlans = async (): Promise<Plan[]> => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token;

    // Construct the full URL to bypass the apiClient's /admin base URL for this specific endpoint
    const fullUrl = `${apiClient.defaults.baseURL?.replace('/admin', '')}/plans`;

    const response = await axios.get<AllPlansResponse>(fullUrl, { // Changed to axios.get with fullUrl
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
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

export const updateMerchantPlan = async (merchantId: string, planId: string): Promise<Merchant> => {
  try {
    const response = await apiClient.put<GenericApiResponse<Merchant>>(`/merchants/${merchantId}/assign-plan`, { planId });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to assign plan to merchant.");
    }
    return response.data.data; // Assuming data field contains the updated Merchant object
  } catch (error) {
    console.error("Failed to update merchant plan:", error);
    throw error;
  }
};

export const createMerchantSubscription = async (merchantId: string, planId: string): Promise<Subscription> => {
  try {
    // Construct the full URL for addon subscriptions
    const fullUrl = `${apiClient.defaults.baseURL?.replace('/admin', '')}/subscriptions/addons`;
    // Expecting a direct Subscription object response, not a GenericApiResponse wrapper
    const response = await apiClient.post<Subscription>(fullUrl, { merchantId, planId });
    
    // No success check needed if the API returns a 2xx status with the data directly
    // If the backend returns a non-2xx status, Axios will throw an error, which the catch block handles
    
    return response.data; // Directly return the Subscription object
  } catch (error) {
    console.error("Failed to create merchant subscription:", error);
    throw error;
  }
};

export const getMerchantSubscriptions = async (merchantId: string): Promise<Subscription[]> => {
  try {
    const response = await apiClient.get<MerchantSubscriptionsResponse>(`/merchants/${merchantId}/subscriptions`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch merchant subscriptions:", error);
    throw error;
  }
};

export const assignMerchantPlan = async (merchantId: string, planId: string): Promise<Subscription> => {
  try {
    const fullUrl = `${apiClient.defaults.baseURL?.replace('/admin', '')}/subscriptions`;
    const response = await apiClient.post<Subscription>(fullUrl, { merchantId, planId });
    return response.data;
  } catch (error) {
    console.error("Failed to assign merchant plan:", error);
    throw error;
  }
};

export const updateSubscriptionStatus = async (subscriptionId: string, status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED'): Promise<Subscription> => {
  try {
    const fullUrl = `${apiClient.defaults.baseURL?.replace('/admin', '')}/subscriptions/${subscriptionId}/status`;
    const response = await apiClient.put<Subscription>(fullUrl, { status });
    return response.data;
  } catch (error) {
    console.error("Failed to update subscription status:", error);
    throw error;
  }
};

export const forceActivateSubscription = async (subscriptionId: string, merchantId: string, notes: string): Promise<Subscription> => {
  try {
    const fullUrl = `${apiClient.defaults.baseURL?.replace('/admin', '')}/subscriptions/force-activate`;
    const response = await apiClient.post<Subscription>(fullUrl, { merchantId, subscriptionId, notes });
    return response.data;
  } catch (error) {
    console.error("Failed to force activate subscription:", error);
    throw error;
  }
};
