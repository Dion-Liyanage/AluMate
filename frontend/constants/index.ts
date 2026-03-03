/**
 * Application constants
 */

export const APP_NAME = 'AluMate';
export const APP_DESCRIPTION = 'Web-based Aluminium Fabrication and Service Management System';

export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  QUOTED: 'quoted',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Public Pages (no login required)
  SERVICES_PUBLIC: '/services',
  ABOUT: '/about',
  CONTACT: '/contact',

  // Customer Routes (login required)
  CUSTOMER_DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  QUOTATIONS: '/quotations',
  SERVICES_REQUESTS: '/services/my-requests',

  // Admin Routes (admin login required)
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_CUSTOMERS: '/admin/customers',

  // Shared Routes
  PROFILE: '/profile',
} as const;
