# AluMate - Project Scope Document

## 1. Project Overview

**Project Name:** AluMate - Web based Aluminium Fabrication and Service Management System

**Description:** A web-based Aluminium Fabrication and Service Management System designed to streamline the operations of aluminium fabrication businesses. The system provides a centralized digital platform where customers can request quotes, place orders, and track fabrication progress, while administrators can efficiently manage orders, services, inventory, workforce, and customer communications.

**Objective:** Replace fragmented, manual, or paper-based aluminium fabrication management methods with a modern, scalable, and secure web application.

---

## 2. Problem Statement

Many aluminium fabrication businesses struggle to:

- Track and manage fabrication orders efficiently
- Maintain accurate inventory of raw materials and finished products
- Communicate order progress and updates to customers
- Schedule and manage service/maintenance requests
- Generate accurate quotations and invoices

Existing systems are often manual, poorly integrated, or lack modern features such as real-time updates, role-based access, and scalable architectures.

---

## 3. Project Objectives

1. Provide a centralized order and service management system
2. Enable customers to request quotes, place orders, and track progress
3. Support fabrication job scheduling and workflow management
4. Improve communication between the business and its customers
5. Provide administrators with tools for efficient business operations
6. Ensure data security and role-based access control
7. Design a scalable and maintainable system using modern technologies

---

## 4. Core Features & Functionalities

### 4.1 Customer Functionalities

- Customer registration and authentication
- Request quotations for fabrication work
- Place and manage fabrication orders
- Track order/fabrication progress in real-time
- View service history and past orders
- Receive notifications and updates on order status
- Submit service/maintenance requests
- Secure login and logout

### 4.2 Administrator Functionalities

- Admin authentication and authorization
- Order management (view, update, assign, complete)
- Quotation creation and management
- Service request handling
- Customer account management (view, update, deactivate)
- Inventory tracking (raw materials, finished products)
- Workforce and job scheduling
- Viewing business analytics and reports
- Role-based access control (RBAC)

### 4.3 System-Level Functionalities

- Secure data storage and retrieval
- API-based communication between frontend and backend
- Environment-based configuration management
- Scalable and modular system design
- Error handling and validation

---

## 5. System Architecture

**Architecture Type:** Monolithic Architecture (Initial Development)

**Characteristics:**

- Single repository containing frontend and backend
- Clear separation of concerns between UI, business logic, and data access
- Modular internal structure to allow future scalability
- Suitable for academic and production-level deployment

---

## 6. Technology Stack

### Frontend

- **Framework:** Next.js (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Real-time:** Socket.io Client
- **Code Quality:** ESLint

### Backend (Planned)

- **Runtime:** Node.js
- **Framework:** NestJS
- **API Type:** RESTful APIs
- **Authentication:** JWT (JSON Web Tokens)
- **Authorization:** Role-Based Access Control (RBAC)
- **Configuration:** Environment Variables (.env)

### Database

- **Type:** NoSQL (Cloud-based)
- **Platform:** MongoDB Atlas

### Development Tools

- **Version Control:** Git & GitHub
- **IDE:** Visual Studio Code
- **Package Manager:** npm

---

## 7. Project Structure

```
/AluMate
  /frontend
    /app                    # Next.js App Router
      /(auth)              # Authentication pages
      /dashboard           # Customer dashboard
      /admin               # Admin dashboard
      /orders              # Order management pages
      /services            # Service request pages
      /profile             # Profile pages
    /components            # React components
      /ui                  # Shared UI components
      /forms               # Form components
      /layout              # Layout components
      /customer            # Customer-specific components
      /admin               # Admin-specific components
    /lib                   # Utilities and helpers
    /types                 # TypeScript definitions
    /hooks                 # Custom React hooks
    /constants             # App constants
    /public                # Static assets
  /backend                 # NestJS backend (to be implemented)
```

---

## 8. Data Management

### Database: MongoDB Atlas

**Collections:**

- Customer profiles
- Authentication credentials (securely stored)
- Fabrication orders and job details
- Quotations and invoices
- Service/maintenance requests
- Inventory (raw materials and finished products)
- Administrative data
- System metadata
- Notifications

---

## 9. Security Considerations

- Secure authentication using JWT
- Password hashing
- Environment variables for sensitive data
- Role-based access control (RBAC)
- API validation and error handling
- Secure HTTP-only cookies
- Input sanitization

---

## 10. Development Phases

### Phase 1: Foundation (Current)

- ✅ Frontend structure setup
- ✅ Next.js project initialization
- ✅ Component library integration (shadcn/ui)
- ⏳ Backend initialization (NestJS)
- ⏳ Database setup (MongoDB Atlas)
- ⏳ JWT authentication implementation

### Phase 2: Core Features

- Customer registration and login
- Order placement and management
- Quotation request and generation
- Admin dashboard basics
- Basic notifications

### Phase 3: Enhancement

- Service/maintenance request management
- Inventory tracking system
- Advanced search and filtering
- Job scheduling and assignment
- Analytics dashboard
- Real-time order status updates (WebSocket)

### Phase 4: Polish & Deployment

- Security hardening
- Performance optimization
- Testing (unit, integration, e2e)
- Documentation
- Deployment setup
- Production launch

---

## 11. Deployment Strategy (Planned)

- Cloud-based deployment
- Containerization support (Docker - future scope)
- Scalable hosting environments
- CI/CD pipeline integration
- Environment-based configuration (dev, staging, production)

---

## 12. Future Enhancements

- Invoice and payment integration
- Material cost calculator
- Delivery tracking and logistics
- Customer feedback and rating system
- Mobile application integration
- Microservices migration (if required)
- Supplier management module
- Automated quotation engine
- Photo/document upload for custom fabrication designs
- Report generation and export (PDF/Excel)
- Integration with accounting software

---

## 13. Success Metrics

- Number of registered customers
- Order processing efficiency
- Average quotation-to-order conversion rate
- Customer satisfaction scores
- System uptime and performance
- Reduction in manual administrative overhead
- Inventory accuracy rate

---

## 14. Constraints & Assumptions

### Constraints

- Development timeline aligned with academic schedule
- Budget limitations for cloud services
- Team size and resource availability

### Assumptions

- Customers have internet access
- Users have basic technical literacy
- Business will provide initial product/service data
- MongoDB Atlas free tier sufficient for initial deployment

---

## 15. Risk Management

| Risk                        | Impact | Mitigation                            |
| --------------------------- | ------ | ------------------------------------- |
| Data security breach        | High   | Implement JWT, RBAC, encryption       |
| Database scalability issues | Medium | Use MongoDB Atlas auto-scaling        |
| Backend delays              | Medium | Frontend-first development approach   |
| Third-party service outages | Low    | Choose reliable cloud providers       |
| User adoption challenges    | Medium | Intuitive UI/UX, onboarding tutorials |

---

## 16. Project Timeline (Estimated)

- **Month 1-2:** Setup, architecture, authentication
- **Month 3-4:** Core features (orders, quotations, admin panel)
- **Month 5:** Enhancements (inventory, services, analytics)
- **Month 6:** Testing, optimization, deployment

---

## 17. Stakeholders

- **Primary Users:** Customers of the aluminium fabrication business
- **Secondary Users:** Business administrators and staff
- **Project Owner:** Aluminium fabrication business management
- **Development Team:** Student developers
- **End Beneficiaries:** Aluminium fabrication business and its customers

---

## 18. Conclusion

AluMate is a comprehensive, modern aluminium fabrication and service management system designed to streamline operations for aluminium fabrication businesses. By using industry-standard technologies (Next.js, NestJS, MongoDB), a clean architectural approach, and scalable design principles, the project aims to deliver a professional-grade solution suitable for both academic evaluation and real-world application.

The system will transform how aluminium fabrication businesses manage their orders, services, inventory, and customer relationships, fostering efficient operations and improved customer satisfaction.

---

**Document Version:** 1.1  
**Last Updated:** March 2, 2026  
**Status:** In Development
