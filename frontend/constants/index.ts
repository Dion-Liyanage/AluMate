/**
 * Application constants
 */

export const APP_NAME = 'AluMate';

export const ROLES = {
  ALUMNI: 'alumni',
  ADMIN: 'admin',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Alumni Dashboard
  ALUMNI_DASHBOARD: '/dashboard',
  
  // Admin Dashboard
  ADMIN_DASHBOARD: '/admin',
  
  // Shared Routes
  EVENTS: '/events',
  PROFILE: '/profile',
} as const;
