/**
 * API client for backend communication
 * Uses axios with JWT token interceptors
 */

import axios from "axios";
import type { User, Order, Quotation, ServiceRequest, InventoryItem, Notification } from "@/types";

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

// Response interceptor — handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("alumate_token");
        localStorage.removeItem("alumate_user");
        // Only redirect if not already on login/register page
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ---------- API Response type ----------

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
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

  create: async (data: {
    title: string;
    description: string;
    materialType?: string;
    dimensions?: string;
    quantity?: number;
  }) => {
    const res = await apiClient.post<ApiResponse<{ order: Order }>>("/orders", data);
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.patch<ApiResponse>(`/orders/${id}/cancel`);
    return res.data;
  },
};

// ---------- Admin Orders API ----------

export const adminOrdersApi = {
  getAll: async (params?: {
    status?: string;
    customerId?: string;
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
    const res = await apiClient.get<ApiResponse<{ order: Order }>>(`/admin/orders/${id}`);
    return res.data;
  },

  update: async (id: string, data: Partial<Order>) => {
    const res = await apiClient.patch<ApiResponse<{ order: Order }>>(
      `/admin/orders/${id}`,
      data
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
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<
      ApiResponse<{ serviceRequests: ServiceRequest[]; total: number }>
    >("/services", { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      `/services/${id}`
    );
    return res.data;
  },

  create: async (data: {
    type: "maintenance" | "repair" | "installation";
    description: string;
    scheduledDate?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<{ serviceRequest: ServiceRequest }>>(
      "/services",
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
  getOverview: async () => {
    const res = await apiClient.get<
      ApiResponse<{
        totalOrders: number;
        totalRevenue: number;
        activeCustomers: number;
        pendingQuotations: number;
        lowStockItems: number;
        serviceRequests: number;
      }>
    >("/admin/analytics/overview");
    return res.data;
  },

  getOrdersData: async () => {
    const res = await apiClient.get<ApiResponse>("/admin/analytics/orders");
    return res.data;
  },

  getRevenueData: async () => {
    const res = await apiClient.get<ApiResponse>("/admin/analytics/revenue");
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
    const res = await apiClient.get<ApiResponse<any[]>>('/designs', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/designs/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<any>>('/designs', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/designs/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/designs/${id}`);
    return res.data;
  },
};

export default apiClient;
