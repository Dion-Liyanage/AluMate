# AluMate Technology Stack

This document provides a comprehensive summary of the technologies, frameworks, and libraries implemented in the AluMate fabrication and service management system.

## 🎨 Frontend (Client-Side)

### Core Framework & Language
*   **Next.js (React)**: Primary framework using App Router for efficient routing and modern UI architecture.
*   **TypeScript**: Ensures type safety across the entire client application.

### UI & Aesthetics
*   **Tailwind CSS**: Utility-first CSS for high-performance, responsive styling.
*   **Framer Motion**: Powering all micro-animations, transitions, and dynamic UI elements.
*   **Lucide React**: Modern and consistent icon library.
*   **Sonner**: Used for elegant, non-blocking toast notifications.
*   **Radix UI & Shadcn UI**: Providing accessible, high-quality base components for the dashboard.

### Design & Visualization
*   **Three.js & @react-three/fiber**: Implementing the 3D visualization engine for aluminium products.
*   **Fabric.js**: Powering the 2D interactive canvas for custom design configurations.

### Analytics & Mapping
*   **Recharts**: Interactive charting library used for Admin Analytics (Revenue trends, Product popularity).
*   **MapLibre GL**: Integrated for handling location data and map visualizations for on-site visits.

### Networking & State
*   **Axios**: HTTP client for all backend API communication.
*   **React Hook Form & Zod**: Robust form management and schema-based validation.
*   **Socket.IO Client**: Enabling real-time, bidirectional communication for the chat system.
*   **Date-fns**: Used for precise date formatting and manipulation across the platform.

---

## ⚙️ Backend (Server-Side)

### Core Framework
*   **NestJS**: Modular, scalable Node.js framework providing the backbone of the API.
*   **Express**: The underlying high-performance web server.

### Real-Time & Communication
*   **Socket.IO**: Real-time engine for the instant messaging and chat system.
*   **Resend API**: Professional email service provider for transactional notifications (Welcome emails, Orders).

### Security & Authentication
*   **Passport.js & JWT**: Industry-standard secure authentication and role-based access control.
*   **Bcrypt.js**: Advanced password hashing for maximum user data protection.

### Data Management
*   **MongoDB Atlas**: Distributed cloud database for persistent storage.
*   **Mongoose (ODM)**: Modeling and validation layer for MongoDB interactions.
*   **Class-Validator**: Decorator-based property validation for all incoming DTOs.

### Cloud Integration
*   **Cloudinary**: Managing cloud storage, transformation, and delivery of project images and design assets.
*   **Streamifier**: Efficiently handling file streams for Cloudinary uploads.

---

## ☁️ Infrastructure & Environment

*   **Cloudinary CDN**: Global content delivery network for optimized media loading.
*   **WSL (Ubuntu)**: The underlying development and runtime environment.
*   **Node.js**: The cross-platform JavaScript runtime environment.
