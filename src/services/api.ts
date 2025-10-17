import axios from 'axios';

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.adpair.co/api'; 

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the authentication token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      // If there's an error parsing user data, clear it
      console.warn('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user');
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
    
    // Attempt refresh for both 401 Unauthorized and 403 Forbidden errors and avoid infinite loops
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' // Don't retry refresh endpoint itself
    ) {
      originalRequest._retry = true;
      
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          // No user data, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const user = JSON.parse(storedUser);
        if (!user.refreshToken) {
          // No refresh token available, redirect to login
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

      
        const refreshUrl = 'https://api.adpair.co/api/auth/refresh';
        
        const refreshResponse = await axios.post(refreshUrl, {
          refreshToken: user.refreshToken,
        });

        // Check if refresh was successful
        if (refreshResponse.data && refreshResponse.data.success && refreshResponse.data.data && refreshResponse.data.data.token) {
          // Update token in localStorage
          user.token = refreshResponse.data.data.token;
          
          // Update refresh token if provided
          if (refreshResponse.data.data.refreshToken) {
            user.refreshToken = refreshResponse.data.data.refreshToken;
          }
          
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update Authorization header for the retry request
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.data.token}`;
          
         
          
          // Retry the original request with new token
          return apiClient(originalRequest);
        } else {
          // Refresh response indicates failure
          console.error('Token refresh failed - invalid response:', refreshResponse.data);
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(new Error('Token refresh failed'));
        }
        
      } catch (refreshError: any) {
        console.error('Token refresh error:', refreshError);
        
        // Check if refresh token is invalid/expired
        if (
          refreshError.response &&
          (refreshError.response.status === 401 || refreshError.response.status === 403)
        ) {
          console.error('Refresh token is invalid/expired, logging out.');
        } else {
          console.error('Network or other error during token refresh.');
        }
        
        // Clear user data and redirect to login
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
    const response = await apiClient.post<PlanCreationResponse>('/plans', planData);
    return response.data;
  } catch (error) {
    console.error("Failed to create plan:", error);
    throw error;
  }
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
    // Expecting a direct Subscription object response, not a GenericApiResponse wrapper
    const response = await apiClient.post<Subscription>('/subscriptions/addons', { merchantId, planId });
    
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
    const response = await apiClient.get<MerchantSubscriptionsResponse>(`/admin/merchants/${merchantId}/subscriptions`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch merchant subscriptions from API, returning dummy data:", error);
    
    // Return dummy subscription data for testing
    const dummySubscriptions: Subscription[] = [
      {
        id: `sub-${merchantId}-1`,
        planName: merchantId.includes('1') ? 'Premium' : 
                 merchantId.includes('2') ? 'Enterprise' : 
                 merchantId.includes('3') ? 'Standard' : 'Basic',
        status: 'ACTIVE',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        amount: merchantId.includes('1') ? 299 : 
               merchantId.includes('2') ? 999 : 
               merchantId.includes('3') ? 99 : 29,
        currency: 'USD',
        billingCycle: merchantId.includes('2') ? 'YEARLY' : 'MONTHLY',
        nextBillingDate: '2024-12-01T00:00:00Z',
        paymentMethod: 'Credit Card',
        transactionId: `txn-${merchantId}-001`,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    
    return dummySubscriptions;
  }
};

export const assignMerchantPlan = async (merchantId: string, planId: string): Promise<Subscription> => {
  try {
    const response = await apiClient.post<Subscription>('/subscriptions', { merchantId, planId });
    return response.data;
  } catch (error) {
    console.error("Failed to assign merchant plan:", error);
    throw error;
  }
};

export const updateSubscriptionStatus = async (subscriptionId: string, status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED'): Promise<Subscription> => {
  try {
    const response = await apiClient.put<Subscription>(`/subscriptions/${subscriptionId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Failed to update subscription status:", error);
    throw error;
  }
};

export const forceActivateSubscription = async (subscriptionId: string, merchantId: string, notes: string): Promise<Subscription> => {
  try {
    const response = await apiClient.post<Subscription>('/subscriptions/force-activate', { merchantId, subscriptionId, notes });
    return response.data;
  } catch (error) {
    console.error("Failed to force activate subscription:", error);
    throw error;
  }
};

// Analytics interfaces
export interface MerchantStats {
  totalMerchants: number;
  activeMerchants: number;
  pendingMerchants: number;
  suspendedMerchants: number;
  cancelledMerchants: number;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  suspendedSubscriptions: number;
  pendingSubscriptions: number;
}

export interface RevenueStats {
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  thisYearRevenue: number;
}

export interface AnalyticsData {
  merchantStats: MerchantStats;
  subscriptionStats: SubscriptionStats;
  revenueStats: RevenueStats;
}

export type AnalyticsResponse = GenericApiResponse<AnalyticsData>;

// Analytics API function
export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await apiClient.get<AnalyticsResponse>('/admin/analytics');
  return response.data.data;
};
