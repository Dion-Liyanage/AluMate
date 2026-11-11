/**
 * API client for backend communication
 * Uses axios with JWT token interceptors
 */

import axios, { type AxiosError } from "axios";
import type {
  User,
  Order,
  Quotation,
  ServiceRequest,
  InventoryItem,
  Notification,
  Project,
  MaterialProfile,
  ProductTemplate,
  OpeningSystem,
  BomInput,
  BomResult,
  CuttingPlan,
} from "@/types";

type BackendErrorPayload = {
  message?: string | string[];
  error?: string;
};

type EnhancedApiError = Error & {
  response?: AxiosError<BackendErrorPayload>["response"];
  status?: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("alumate_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 unauthorized and extract backend error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorPayload>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("alumate_token");
        localStorage.removeItem("alumate_user");
        // Clear the middleware cookie too, otherwise /login bounces back to
        // /dashboard and the two redirects loop forever.
        document.cookie = "alumate_token=; path=/; max-age=0";
        // Only redirect if not already on login/register page
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
      }
    }

    // Extract the backend's error message so UI can display it meaningfully
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    const enhancedError: EnhancedApiError = new Error(
      Array.isArray(backendMessage) ? backendMessage.join(", ") : backendMessage
    );
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    return Promise.reject(enhancedError);
  }
);

// ---------- API Response type ----------

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface MaterialUsageInput {
  projectName: string;
  purchasedKg: number;
  usedKg: number;
  reusableOffcutsKg: number;
  scrapWasteKg: number;
  totalCost: number;
}

export interface MaterialUsageRecord extends MaterialUsageInput {
  _id: string;
  orderId?: string;
  orderNumber?: string;
  costPerKg: number;
  recordedAt: string;
  hasPlan: boolean;
}

export interface PlanComparison {
  orderNumber: string;
  projectName: string;
  recordedAt: string;
  plannedScrapKg: number;
  actualScrapKg: number;
  extraScrapKg: number;
  plannedWasteRate: number;
  actualWasteRate: number;
  difference: number;
}

export type FabricationMaterialUsageInput = Omit<MaterialUsageInput, "projectName">;

export interface SustainabilityDashboardData {
  summary: {
    purchasedKg: number;
    usedKg: number;
    reusableOffcutsKg: number;
    scrapWasteKg: number;
    costSaved: number;
    wasteRate: number;
    efficiencyPct: number;
  };
  planAccuracy: {
    ordersWithPlan: number;
    totalOrders: number;
    plannedWasteRate: number;
    actualWasteRate: number;
    extraScrapKg: number;
    highWasteMarginPct: number;
  };
  plannedVsActual: PlanComparison[];
  highWasteOrders: PlanComparison[];
  materialDistribution: Array<{ name: string; value: number; color: string }>;
  monthlyWaste: Array<{ month: string; wasteRate: number }>;
  projects: Array<{
    project: string;
    used: number;
    reusable: number;
    scrap: number;
    purchased: number;
    wasteRate: number;
  }>;
}

// ---------- Auth API ----------

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>(
      "/auth/login",
      { email, password }
    );
    return res.data;
  },

  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    const res = await apiClient.post<ApiResponse>("/auth/register", data);
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse>("/auth/logout");
    return res.data;
  },
};

// ---------- Orders API ----------

export const ordersApi = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<{ orders: Order[]; total: number }>>(
      "/orders",
      { params }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<{ order: Order }>>("/orders", data);
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.patch<ApiResponse>(`/orders/${id}/cancel`);
    return res.data;
  },

  approve: async (id: string) => {
    const res = await apiClient.patch<ApiResponse>(`/orders/${id}/approve`);
    return res.data;
  },
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/orders/stats');
    return res.data;
  },
};

// ---------- Admin Orders API ----------

export const adminOrdersApi = {
  getAll: async (params?: {
    status?: string;
    customerId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<{ orders: Order[]; total: number }>>(
      "/admin/orders",
      { params }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ data: Order }>>(`/admin/orders/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await apiClient.get<ApiResponse<any>>("/admin/orders/stats");
    return res.data;
  },

  updateStatus: async (id: string, data: { status: string; progress?: number }) => {
    const res = await apiClient.patch<ApiResponse<{ data: Order }>>(
      `/admin/orders/${id}/status`,
      data
    );
    return res.data;
  },

  getCuttingPlan: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CuttingPlan | null>>(`/admin/orders/${id}/cutting-plan`);
    return response.data;
  },
  completeFabrication: async (id: string, data: FabricationMaterialUsageInput) => {
    const res = await apiClient.post<ApiResponse>(
      `/admin/orders/${id}/complete-fabrication`,
      data
    );
    return res.data;
  },

  generateQuotation: async (id: string, data?: {
    finalMaterialCost?: number;
    finalLaborCost?: number;
    finalTotalCost?: number;
    adminNotes?: string;
    expectedCompletionDate?: string;
    quotationPdf?: File;
  }) => {
    const formData = new FormData();
    if (data?.finalMaterialCost !== undefined) formData.append('finalMaterialCost', String(data.finalMaterialCost));
    if (data?.finalLaborCost !== undefined) formData.append('finalLaborCost', String(data.finalLaborCost));
    if (data?.finalTotalCost !== undefined) formData.append('finalTotalCost', String(data.finalTotalCost));
    if (data?.adminNotes) formData.append('adminNotes', data.adminNotes);
    if (data?.expectedCompletionDate) formData.append('expectedCompletionDate', data.expectedCompletionDate);
    if (data?.quotationPdf) formData.append('quotationPdf', data.quotationPdf);

    const res = await apiClient.post<ApiResponse<{ data: Order }>>(
      `/admin/orders/${id}/generate-quotation`,
      formData
    );
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<{ data: Order }>>(
      `/admin/orders/${id}/cancel`
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/admin/orders/${id}`);
    return res.data;
  },
};

// ---------- Quotations API ----------

export const quotationsApi = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<{ quotations: Quotation[]; total: number }>>(
      "/quotations",
      { params }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ quotation: Quotation }>>(
      `/quotations/${id}`
    );
    return res.data;
  },

  request: async (data: {
    description: string;
    material?: string;
    dimensions?: string;
    quantity?: number;
  }) => {
    const res = await apiClient.post<ApiResponse<{ quotation: Quotation }>>(
      "/quotations/request",
      data
    );
    return res.data;
  },

  accept: async (id: string) => {
    const res = await apiClient.patch<ApiResponse>(`/quotations/${id}/accept`);
    return res.data;
  },

  reject: async (id: string) => {
    const res = await apiClient.patch<ApiResponse>(`/quotations/${id}/reject`);
    return res.data;
  },
};

// ---------- Services API ----------

export const servicesApi = {
  // Customer: Get own requests
  getMyRequests: async () => {
    const res = await apiClient.get<
      ApiResponse<{ serviceRequests: ServiceRequest[]; total: number }>
    >("/services/my-requests");
    return res.data;
  },

  // Customer: Cancel own service request
  cancelMyRequest: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      `/services/${id}/cancel`
    );
    return res.data;
  },

  // Customer: Submit on-site visit request
  createOnSiteVisit: async (data: {
    date: string;
    timeSlot: string;
    fullName: string;
    contactNumber: string;
    nearestTown: string;
    location?: { lat: number; lng: number };
    manualAddress?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      "/services/on-site-visit",
      data
    );
    return res.data;
  },

  // Authenticated users: get currently available (not booked) slots for a date
  getAvailability: async (date: string) => {
    const res = await apiClient.get<ApiResponse<{ date: string; slots: string[] }>>(
      "/services/availability",
      { params: { date } }
    );
    return res.data;
  },

  // Authenticated users: get dates that have at least one available slot
  getAvailabilityDates: async () => {
    try {
      const res = await apiClient.get<ApiResponse<{ dates: string[] }>>(
        "/services/availability/dates"
      );
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const fallbackRes = await apiClient.get<ApiResponse<{ dates: string[] }>>(
          "/services/availability"
        );
        return fallbackRes.data;
      }
      throw error;
    }
  },

  // Admin: get configured slots for a date (before booking subtraction)
  getAvailabilityConfig: async (date: string) => {
    const res = await apiClient.get<ApiResponse<{ date: string; slots: string[] }>>(
      "/services/availability/config",
      { params: { date } }
    );
    return res.data;
  },

  // Admin: list all configured availability records
  getAllAvailability: async () => {
    const res = await apiClient.get<
      ApiResponse<{ availability: { date: string; slots: string[] }[]; total: number }>
    >("/services/availability/all");
    return res.data;
  },

  // Admin: create/update configured availability for a date
  upsertAvailability: async (data: { date: string; slots: string[] }) => {
    const res = await apiClient.post<ApiResponse<{ availability: { date: string; slots: string[] } }>>(
      "/services/availability",
      data
    );
    return res.data;
  },

  // Admin: delete configured availability for a date
  deleteAvailability: async (date: string) => {
    try {
      const res = await apiClient.delete<ApiResponse>(`/services/availability/${date}`);
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        const fallbackRes = await apiClient.post<ApiResponse>(
          "/services/availability/delete",
          { date }
        );
        return fallbackRes.data;
      }
      throw error;
    }
  },

  // Customer: Submit repair request (with image upload)
  createRepair: async (data: {
    orderId: string;
    issueDescription: string;
    image?: File;
  }) => {
    const formData = new FormData();
    formData.append("orderId", data.orderId);
    formData.append("issueDescription", data.issueDescription);
    if (data.image) {
      formData.append("image", data.image);
    }
    const res = await apiClient.post<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      "/services/repair",
      formData
    );
    return res.data;
  },

  // Admin: Get all service requests (with filtering)
  getAll: async (params?: { serviceType?: string; status?: string }) => {
    const res = await apiClient.get<
      ApiResponse<{ serviceRequests: ServiceRequest[]; total: number }>
    >("/services", { params });
    return res.data;
  },

  // Get a single request by ID
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      `/services/${id}`
    );
    return res.data;
  },

  // Admin: Update status
  updateStatus: async (id: string, data: { status: string; adminNotes?: string }) => {
    const res = await apiClient.patch<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      `/services/${id}/status`,
      data
    );
    return res.data;
  },

  // Admin: Update on-site visit schedule
  updateSchedule: async (
    id: string,
    data: { date: string; timeSlot: string; adminNotes?: string }
  ) => {
    const res = await apiClient.patch<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      `/services/${id}/schedule`,
      data
    );
    return res.data;
  },
};

// ---------- Admin Inventory API ----------

export const inventoryApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<
      ApiResponse<{ items: InventoryItem[]; total: number }>
    >("/admin/inventory", { params });
    return res.data;
  },

  create: async (data: Partial<InventoryItem>) => {
    const res = await apiClient.post<ApiResponse<{ item: InventoryItem }>>(
      "/admin/inventory",
      data
    );
    return res.data;
  },

  update: async (id: string, data: Partial<InventoryItem>) => {
    const res = await apiClient.patch<ApiResponse<{ item: InventoryItem }>>(
      `/admin/inventory/${id}`,
      data
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/admin/inventory/${id}`);
    return res.data;
  },
};

// ---------- Notifications API ----------

// ==================== SAVED DESIGNS (design studio drafts) ====================

export interface SavedDesignRecord {
  id: string;
  name: string;
  productType: string;
  designJson?: string;
  previewImage: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedDesignInput {
  name: string;
  productType: string;
  designJson: string;
  previewImage?: string;
  description?: string;
}

export const savedDesignsApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<SavedDesignRecord[]>>("/saved-designs");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<SavedDesignRecord>>(
      `/saved-designs/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  save: async (id: string, data: SavedDesignInput) => {
    const res = await apiClient.put<ApiResponse<SavedDesignRecord>>(
      `/saved-designs/${encodeURIComponent(id)}`,
      data
    );
    return res.data;
  },

  importMany: async (
    designs: (SavedDesignInput & { id: string; createdAt?: string; updatedAt?: string })[]
  ) => {
    const res = await apiClient.post<ApiResponse<{ imported: number }>>(
      "/saved-designs/import",
      { designs }
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/saved-designs/${encodeURIComponent(id)}`);
    return res.data;
  },
};

export const notificationsApi = {
  getAll: async (params?: { isRead?: boolean; page?: number; limit?: number }) => {
    const res = await apiClient.get<
      ApiResponse<{ notifications: Notification[]; total: number }>
    >("/notifications", { params });
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<ApiResponse>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch<ApiResponse>("/notifications/read-all");
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await apiClient.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
    return res.data;
  },
};

// ---------- Profile API ----------

export const profileApi = {
  get: async () => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>("/profile");
    return res.data;
  },

  update: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>("/profile", data);
    return res.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await apiClient.patch<ApiResponse>("/profile/password", data);
    return res.data;
  },
};

// ---------- Admin Analytics API ----------

export const analyticsApi = {
  getDashboardData: async () => {
    const res = await apiClient.get<ApiResponse<{
      stats: {
        totalOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        pendingQuotations: number;
        activeServiceRequests: number;
      };
      chartData: { name: string; orders: number }[];
      activity: { id: string; message: string; time: string; type: string }[];
    }>>("/admin/analytics/dashboard");
    return res.data;
  },
};

// ---------- Admin Customers API ----------

export const adminCustomersApi = {
  getAll: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<{ customers: User[]; total: number }>>(
      "/admin/customers",
      { params }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ customer: User; orders: Order[] }>>(
      `/admin/customers/${id}`
    );
    return res.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const res = await apiClient.patch<ApiResponse<{ customer: User }>>(
      `/admin/customers/${id}`,
      data
    );
    return res.data;
  },
};

// ---------- Designs Catalogue API ----------

export const designsApi = {
  getAll: async (params?: { category?: string }) => {
    const res = await apiClient.get<any>('/designs', { params });
    if (Array.isArray(res.data)) {
      return { success: true, data: res.data } as ApiResponse<any[]>;
    }
    return res.data as ApiResponse<any[]>;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<any>(`/designs/${id}`);
    if (res.data && typeof res.data === 'object' && 'success' in res.data) {
      return res.data as ApiResponse<any>;
    }
    return { success: true, data: res.data } as ApiResponse<any>;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<any>>('/designs', formData);
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/designs/${id}`, formData);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/designs/${id}`);
    return res.data;
  },
};

// ---------- Projects API ----------

export const projectsApi = {
  getAll: async (params?: { category?: string }) => {
    const res = await apiClient.get<any>('/projects', { params });
    if (Array.isArray(res.data)) {
      return { success: true, data: res.data } as ApiResponse<Project[]>;
    }
    return res.data as ApiResponse<Project[]>;
  },
  getAllAdmin: async (params?: { category?: string }) => {
    const res = await apiClient.get<any>('/projects/admin', { params });
    if (Array.isArray(res.data)) {
      return { success: true, data: res.data } as ApiResponse<Project[]>;
    }
    return res.data as ApiResponse<Project[]>;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<any>(`/projects/${id}`);
    if (res.data && typeof res.data === 'object' && 'success' in res.data) {
      return res.data as ApiResponse<Project>;
    }
    return { success: true, data: res.data } as ApiResponse<Project>;
  },
  getCount: async () => {
    const res = await apiClient.get<{ count: number }>('/projects/count');
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<Project>>('/projects', formData);
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, formData);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/projects/${id}`);
    return res.data;
  },
};

export const sustainabilityApi = {
  getDashboard: async () => {
    const response = await apiClient.get<ApiResponse<SustainabilityDashboardData>>(
      "/admin/sustainability/dashboard"
    );
    return response.data;
  },
  recordMaterialUsage: async (data: MaterialUsageInput) => {
    const response = await apiClient.post<ApiResponse>(
      "/admin/sustainability/material-usage",
      data
    );
    return response.data;
  },
  getRecords: async () => {
    const response = await apiClient.get<ApiResponse<MaterialUsageRecord[]>>(
      "/admin/sustainability/records"
    );
    return response.data;
  },
  updateRecord: async (id: string, data: Partial<MaterialUsageInput>) => {
    const response = await apiClient.patch<ApiResponse>(`/admin/sustainability/records/${id}`, data);
    return response.data;
  },
  deleteRecord: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/admin/sustainability/records/${id}`);
    return response.data;
  },
};

// ---------- Materials & BOM API ----------

export type ProfileInput = Omit<MaterialProfile, "_id" | "isSample">;
export type ProductTemplateInput = Omit<ProductTemplate, "_id" | "isSample">;

export const materialsApi = {
  getSystems: async (productType?: string) => {
    const response = await apiClient.get<ApiResponse<OpeningSystem[]>>("/materials/systems", {
      params: productType ? { productType } : undefined,
    });
    return response.data;
  },
  estimate: async (data: BomInput & { productType: string; systemType: string }) => {
    const response = await apiClient.post<ApiResponse<BomResult>>("/materials/estimate", data);
    return response.data;
  },
};

export const adminMaterialsApi = {
  getProfiles: async () => {
    const response = await apiClient.get<ApiResponse<MaterialProfile[]>>("/admin/materials/profiles");
    return response.data;
  },
  createProfile: async (data: ProfileInput) => {
    const response = await apiClient.post<ApiResponse<MaterialProfile>>("/admin/materials/profiles", data);
    return response.data;
  },
  updateProfile: async (id: string, data: Partial<ProfileInput>) => {
    const response = await apiClient.patch<ApiResponse<MaterialProfile>>(`/admin/materials/profiles/${id}`, data);
    return response.data;
  },
  deleteProfile: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/admin/materials/profiles/${id}`);
    return response.data;
  },
  getTemplates: async () => {
    const response = await apiClient.get<ApiResponse<ProductTemplate[]>>("/admin/materials/templates");
    return response.data;
  },
  getTemplate: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ProductTemplate>>(`/admin/materials/templates/${id}`);
    return response.data;
  },
  createTemplate: async (data: ProductTemplateInput) => {
    const response = await apiClient.post<ApiResponse<ProductTemplate>>("/admin/materials/templates", data);
    return response.data;
  },
  updateTemplate: async (id: string, data: Partial<ProductTemplateInput>) => {
    const response = await apiClient.patch<ApiResponse<ProductTemplate>>(`/admin/materials/templates/${id}`, data);
    return response.data;
  },
  deleteTemplate: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/admin/materials/templates/${id}`);
    return response.data;
  },
  previewTemplate: async (template: ProductTemplateInput, input: BomInput) => {
    const response = await apiClient.post<ApiResponse<BomResult>>("/admin/materials/templates/preview", {
      template,
      input,
    });
    return response.data;
  },
};

export default apiClient;

// ---------- AI Assistant ----------

export interface AiDesignRef {
  id: string;
  designCode: string;
  title: string;
  category?: string;
  imageUrl?: string;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  designs: AiDesignRef[];
  createdAt?: string;
}

export const aiChatApi = {
  send: async (data: { message?: string; conversationId?: string; image?: Blob }) => {
    const form = new FormData();
    if (data.message) form.append("message", data.message);
    if (data.conversationId) form.append("conversationId", data.conversationId);
    if (data.image) form.append("image", data.image, "photo.jpg");
    const res = await apiClient.post<ApiResponse<{ conversationId: string; reply: AiChatMessage }>>(
      "/ai-chat/messages",
      form,
      { timeout: 90_000 },
    );
    return res.data;
  },
  getConversation: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ conversationId: string; messages: AiChatMessage[] }>>(
      `/ai-chat/conversations/${id}`,
    );
    return res.data;
  },
};

export interface AiConversationSummary {
  conversationId: string;
  title: string;
  preview: string;
  imageUrl?: string;
  messageCount: number;
  updatedAt: string;
}

export const aiChatHistoryApi = {
  /** Logged-in: the account's chats. Guests: pass the ids this browser remembers. */
  list: async (guestIds: string[] = []) => {
    const res = await apiClient.get<ApiResponse<AiConversationSummary[]>>("/ai-chat/conversations", {
      params: guestIds.length ? { ids: guestIds.join(",") } : undefined,
    });
    return res.data;
  },
};
