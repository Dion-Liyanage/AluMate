/**
 * TypeScript type definitions
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: 'pending' | 'quoted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  quotationId?: string;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotation {
  id: string;
  customerId: string;
  orderId?: string;
  items: QuotationItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: Date;
  createdAt: Date;
}

export interface QuotationItem {
  description: string;
  material: string;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  type: 'maintenance' | 'repair' | 'installation';
  description: string;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed';
  scheduledDate?: Date;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'raw-material' | 'finished-product';
  quantity: number;
  unit: string;
  reorderLevel: number;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'quotation' | 'service' | 'system';
  isRead: boolean;
  createdAt: Date;
}

export interface ProjectFeedback {
  name: string;
  comment: string;
  rating: number;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  feedbacks: ProjectFeedback[];
  location?: string;
  materialUsed?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
