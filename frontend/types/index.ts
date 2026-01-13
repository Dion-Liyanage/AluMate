/**
 * TypeScript type definitions
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'alumni' | 'admin';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
}
