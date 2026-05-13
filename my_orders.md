admin-dashboard-orders-backend-plan.md
# AluMate – Admin Dashboard Orders Backend Development Plan
## Fabrication Workflow, Quotation & Order Management Backend

---

# Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the backend architecture and implementation plan for:

Admin Dashboard → Orders Module

The purpose of this backend system is to:

- manage fabrication orders
- process quotations
- control fabrication workflows
- manage installations
- handle material recommendations
- calculate labor costs
- manage production stages
- generate PDFs
- support scalable admin operations

while maintaining:

- modular architecture
- scalable APIs
- secure role-based access
- realistic fabrication workflows
- mock-to-real data scalability

---

# 1. CORE OBJECTIVE

The Orders backend should function as:

"a centralized fabrication workflow management system"

for aluminium fabrication business operations.

---

# 2. ADMIN RESPONSIBILITIES

Admins should be able to:

- review customer orders
- manage custom designs
- manage catalogue orders
- generate quotations
- update workflow statuses
- assign materials
- review labor calculations
- schedule installations
- generate invoices
- monitor order history

---

# 3. COMPLETE WORKFLOW

Customer Creates Design
        ↓
Order Submitted
        ↓
Backend Creates Draft Order
        ↓
Material Recommendation Engine
        ↓
Labor Calculation Engine
        ↓
Quotation Generation
        ↓
Admin Review
        ↓
Quotation Sent
        ↓
Customer Approval
        ↓
Production Workflow
        ↓
Installation Scheduling
        ↓
Order Completion

---

# 4. DATABASE COLLECTIONS

Recommended MongoDB collections:

- users
- orders
- quotations
- orderDesigns
- orderMaterials
- materialRules
- laborRules
- invoices
- orderStatusHistory
- installationSchedules
- notifications

---

# 5. ORDERS COLLECTION STRUCTURE

## Collection

orders

---

## Example Schema

```json
{
  "_id": "ObjectId",

  "orderId": "ALU-ORD-1001",

  "customerId": "ObjectId",

  "productType": "Window",

  "designType": "custom",

  "designId": "ObjectId",

  "quotationId": "ObjectId",

  "status": "Quotation Pending",

  "progress": 25,

  "estimatedPrice": 85000,

  "approvedPrice": 0,

  "measurements": {
    "width": 1800,
    "height": 1200
  },

  "purpose": "Heavy Usage",

  "environment": "Outdoor",

  "strengthCategory": "Heavy Duty",

  "selectedColor": "Black",

  "recommendedMaterials": [],

  "laborCalculation": {},

  "installation": {},

  "attachments": [],

  "createdAt": "Date",

  "updatedAt": "Date"
}
6. ORDER STATUS WORKFLOW

Recommended statuses:

Draft
Quotation Pending
Quotation Sent
Approved
Material Preparation
In Production
Installation Scheduled
Installing
Completed
Cancelled
7. STATUS HISTORY TRACKING

Track every workflow transition.

Example Schema
{
  "orderId": "ObjectId",

  "previousStatus": "Approved",

  "newStatus": "In Production",

  "changedBy": "Admin",

  "changedAt": "Date"
}
8. ORDER ID GENERATION
Recommended Format
ALU-ORD-1001
Requirements
unique
sequential
auto-generated
indexed
9. MATERIAL RECOMMENDATION ENGINE
Core Objective

Automatically recommend:

aluminium profiles
glass types
accessories
frame thickness
hardware

based on:

product type
measurements
usage purpose
strength requirements
environment
10. MATERIAL RULES COLLECTION

Admins control all recommendation logic.

Example Schema
{
  "productType": "Window",

  "designCategory": "Sliding",

  "minWidth": 0,

  "maxWidth": 2400,

  "purpose": "Heavy Usage",

  "recommendedProfile": "80mm Sliding",

  "thickness": "1.4mm"
}
11. MATERIAL PRICING SYSTEM

Admins should manage:

price per feet
thickness pricing
glass prices
accessory prices
12. MATERIAL STORAGE STRUCTURE
{
  "profileName": "80mm Sliding",

  "thickness": "1.4mm",

  "quantityFeet": 22,

  "pricePerFeet": 1600,

  "materialCost": 35200
}
13. LABOR CALCULATION ENGINE
Core Logic

Labor should calculate:

area (sq.ft) × labor rate
14. LABOR RULES COLLECTION

Admins should configure:

labor rates
product type rates
material-based rates
Example Schema
{
  "productType": "Window",

  "profileName": "80mm Sliding",

  "laborRatePerSqFt": 350
}
15. LABOR STORAGE STRUCTURE
{
  "areaSqFt": 24,

  "laborRate": 350,

  "laborCost": 8400
}
16. QUOTATION SYSTEM
Quotations Collection

Store:

quotation breakdown
admin notes
PDF paths
approval status
Example Schema
{
  "quotationId": "ALU-QT-1001",

  "orderId": "ObjectId",

  "materialCost": 55000,

  "laborCost": 8400,

  "installationCost": 5000,

  "transportCost": 2500,

  "totalAmount": 70900,

  "status": "Pending"
}
17. INSTALLATION MANAGEMENT

Store:

installation dates
assigned team
location details
transport notes
Example Schema
{
  "orderId": "ObjectId",

  "installationDate": "Date",

  "assignedTeam": "Team A",

  "status": "Scheduled"
}
18. FILE STORAGE SYSTEM

Backend should support:

quotation PDFs
invoices
design previews
customer uploads
production images
19. STORAGE OPTIONS
Development
local uploads folder
Production
Cloudinary
AWS S3
Supabase Storage
20. ORDER SEARCH SYSTEM

Support:

order ID search
customer search
quotation search
status filters
product filters
date filters
21. SEARCH API EXAMPLE
GET /api/admin/orders?status=Approved
22. ROLE-BASED ACCESS CONTROL

Only admins should:

update workflows
generate quotations
edit material rules
manage installations
23. SECURITY REQUIREMENTS

Protect:

quotations
invoices
uploads
customer information
Recommended Security
JWT authentication
admin middleware
role validation
request validation
24. PAGINATION SUPPORT

Support:

page
limit
sorting
Example
GET /api/admin/orders?page=1&limit=20
25. ORDER DETAILS API
Endpoint
GET /api/admin/orders/:id
Response Should Include
order details
material breakdown
labor calculations
quotation
files
workflow history
installation details
26. ADMIN ACTION APIS
Generate Quotation
POST /api/admin/orders/:id/generate-quotation
Update Workflow Status
PATCH /api/admin/orders/:id/status
Schedule Installation
PATCH /api/admin/orders/:id/installation
Mark Completed
PATCH /api/admin/orders/:id/complete
27. ORDER PROGRESS MAPPING
Status	Progress
Draft	0%
Quotation Pending	10%
Approved	25%
Material Preparation	40%
Production	60%
Installation Scheduled	80%
Completed	100%
28. PDF GENERATION SYSTEM

Generate:

quotations
invoices
order summaries
29. PDF CONTENT

Include:

company branding
customer information
material breakdown
labor calculations
installation charges
total quotation
30. NOTIFICATION SYSTEM

Notify:

quotation sent
quotation approved
production started
installation scheduled
completed orders
31. RECOMMENDED API STRUCTURE
/api/admin/orders
/api/admin/orders/:id
/api/admin/orders/:id/status
/api/admin/orders/:id/generate-quotation
/api/admin/orders/:id/installation
/api/admin/orders/:id/files
32. SERVICE LAYER STRUCTURE
services/

order.service.ts
quotation.service.ts
material.service.ts
labor.service.ts
installation.service.ts
pdf.service.ts
notification.service.ts
33. CONTROLLER STRUCTURE
controllers/

adminOrder.controller.ts
quotation.controller.ts
installation.controller.ts
34. MOCK DATA ARCHITECTURE

Frontend components should NEVER directly use mock data.

Instead use:

UI Components
↓
Hooks
↓
Service Layer
↓
Mock Data / API

This allows:

backend replacement without UI rewrites
scalable frontend architecture
easier testing
35. RECOMMENDED PROJECT STRUCTURE
src/

mock/
    orders.mock.ts

services/
    adminOrder.service.ts

hooks/
    useAdminOrders.ts

types/
    order.types.ts

components/
    admin/orders/
36. VALIDATION REQUIREMENTS

Validate:

measurements
quotation totals
workflow transitions
uploaded files
installation schedules
37. ERROR HANDLING

Return consistent responses.

Example
{
  "success": false,
  "message": "Order not found"
}
38. DATABASE INDEXING

Recommended indexes:

orderId
customerId
status
createdAt
39. FRONTEND INTEGRATION REQUIREMENTS

Backend must support:

overview cards
filters
workflow management
quotation panels
installation scheduling
material breakdowns
PDF downloads
40. FUTURE SCALABILITY

Architecture should support:

online payments
technician tracking
live production updates
delivery tracking
AI quotation optimization
mobile apps
41. DEVELOPMENT PHASES
PHASE 1
schemas
order CRUD
workflow management
PHASE 2
material recommendation engine
labor calculation engine
PHASE 3
quotation generation
PDF generation
PHASE 4
installation scheduling
notifications
PHASE 5
analytics
optimization
scalability improvements
42. FINAL BACKEND OBJECTIVE

The Orders backend should behave as:

"a realistic aluminium fabrication workflow management system"

NOT:

"a simple admin CRUD backend"

43. SUMMARY

This backend module manages:

fabrication workflows
quotations
material recommendations
labor calculations
installations
invoices
workflow tracking
scalable admin operations

while maintaining:

modular architecture
scalable APIs
realistic fabrication logic
mock-to-real data scalability
secure backend structure