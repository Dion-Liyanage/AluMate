user-dashboard-my-orders-backend-with-mock-data-architecture.md
# AluMate – User Dashboard My Orders Backend Development Plan
## Backend Architecture + Mock Data Replacement Strategy

---

# Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the backend architecture and implementation plan for:

User Dashboard → My Orders Module

including:

- order workflow management
- quotation handling
- material & labor calculations
- API architecture
- mock data strategy
- frontend integration architecture

The system is designed to support:

- scalable backend development
- mock-to-real API transition
- modular services
- future feature expansion

without requiring frontend rewrites.

---

# 1. CORE OBJECTIVE

The My Orders backend should function as:

"a scalable fabrication workflow management system"

for residential aluminium fabrication customers.

---

# 2. IMPORTANT DEVELOPMENT PRINCIPLE

The frontend MUST NOT depend directly on:

- hardcoded mock arrays
- database schemas
- specific API structures

Instead:

```text
UI Components
    ↓
Hooks
    ↓
Service Layer
    ↓
Mock Data OR API

This allows:

rapid frontend development
easy backend integration
scalable architecture
maintainable codebase
3. MOCK DATA ARCHITECTURE
IMPORTANT RULE

Frontend components should NEVER directly contain mock data.

BAD PRACTICE
const orders = [...]

inside component files.

CORRECT PRACTICE
const { orders } = useOrders()
4. RECOMMENDED PROJECT STRUCTURE
src/

mock/
    orders.mock.ts

services/
    order.service.ts

hooks/
    useOrders.ts

types/
    order.types.ts

components/
    dashboard/orders/
5. DEVELOPMENT FLOW
PHASE 1 — UI Development

Frontend retrieves:

Mock Data

through services.

PHASE 2 — Backend Integration

Replace:

mock data source

with:

real API requests

WITHOUT changing UI components.

6. MOCK DATA FILE STRUCTURE
orders.mock.ts
export const mockOrders = [
  {
    id: "ALU-ORD-1001",

    productType: "Window",

    status: "In Production",

    estimatedPrice: 85000,

    progress: 50,
  },
]
7. SERVICE LAYER ARCHITECTURE
order.service.ts

Initial implementation:

import { mockOrders } from "@/mock/orders.mock"

export async function getOrders() {
  return mockOrders
}
AFTER BACKEND INTEGRATION
export async function getOrders() {
  const res = await api.get("/orders")
  return res.data
}
8. HOOK ARCHITECTURE
useOrders.ts
export function useOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    getOrders().then(setOrders)
  }, [])

  return { orders }
}
9. BENEFITS OF THIS ARCHITECTURE

This structure allows:

backend replacement without UI rewrites
easier testing
scalable APIs
modular architecture
reusable hooks
cleaner frontend logic
10. CORE BACKEND RESPONSIBILITIES

The backend should manage:

order creation
quotation tracking
fabrication workflow
material calculations
labor calculations
order progress
PDF generation
service requests
notifications
11. OVERALL ORDER WORKFLOW

User Creates Design
↓
Configuration Submitted
↓
Order Created
↓
Material Recommendation Engine
↓
Labor Calculation
↓
Quotation Generation
↓
Admin Review
↓
Quotation Approval
↓
Production
↓
Installation
↓
Completed

12. DATABASE COLLECTIONS

Recommended MongoDB collections:

users
orders
quotations
orderDesigns
orderMaterials
invoices
serviceRequests
orderStatusHistory
13. ORDERS COLLECTION STRUCTURE
Example Schema
{
  "_id": "ObjectId",

  "orderId": "ALU-ORD-1001",

  "customerId": "ObjectId",

  "productType": "Window",

  "designType": "custom",

  "status": "Quotation Pending",

  "progress": 25,

  "estimatedPrice": 85000,

  "measurements": {
    "width": 1800,
    "height": 1200
  },

  "purpose": "Heavy Usage",

  "environment": "Outdoor",

  "strengthCategory": "Heavy Duty",

  "recommendedMaterials": [],

  "laborCalculation": {},

  "attachments": [],

  "createdAt": "Date",

  "updatedAt": "Date"
}
14. ORDER STATUS WORKFLOW

Recommended statuses:

Draft
Quotation Pending
Quotation Sent
Approved
In Production
Installation Scheduled
Completed
Cancelled
15. ORDER STATUS HISTORY

Track all workflow changes.

Example
{
  "orderId": "ObjectId",

  "previousStatus": "Approved",

  "newStatus": "In Production",

  "changedBy": "Admin",

  "changedAt": "Date"
}
16. MATERIAL RECOMMENDATION STORAGE

Orders should permanently store:

selected profiles
accessories
glass selections
profile thickness
material pricing snapshot

This prevents quotation changes if admin updates prices later.

17. MATERIAL STORAGE STRUCTURE
{
  "profileName": "80mm Sliding",

  "thickness": "1.4mm",

  "quantityFeet": 22,

  "pricePerFeet": 1600,

  "materialCost": 35200
}
18. LABOR CALCULATION STORAGE

Store:

area calculations
labor rate
labor total
Example
{
  "areaSqFt": 24,

  "laborRate": 350,

  "laborCost": 8400
}
19. QUOTATION STORAGE

Store:

quotation breakdown
admin notes
generated PDFs
approval status
Example
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
20. FILE STORAGE SYSTEM

Backend should support:

quotation PDFs
invoices
uploaded references
design previews
21. STORAGE OPTIONS
Development
local uploads folder
Production
Cloudinary
AWS S3
Supabase Storage
22. ORDER SEARCH SYSTEM

Backend should support:

order ID search
quotation search
status filters
product type filters
date filters
23. USER AUTHORIZATION

Users should ONLY access:

their own orders
24. SECURITY REQUIREMENTS

Protect:

quotation data
invoices
uploads
customer information
Recommended Security
JWT authentication
middleware protection
role validation
request validation
25. PAGINATION SUPPORT

Support:

page
limit
sorting
Example
GET /api/orders?page=1&limit=10
26. ORDER DETAILS API
Endpoint
GET /api/orders/:id
Response Should Include
order details
quotation
material breakdown
labor calculations
progress history
services
files
27. USER ACTION APIS
Approve Quotation
PATCH /api/orders/:id/approve
Cancel Order
PATCH /api/orders/:id/cancel
Request Service
POST /api/orders/:id/service-request
28. ORDER PROGRESS MAPPING
Status	Progress
Draft	0%
Quotation Pending	10%
Approved	25%
Production	50%
Installation	75%
Completed	100%
29. PDF GENERATION SYSTEM

Generate:

quotation PDFs
invoices
order summaries
30. PDF CONTENT

Include:

company branding
quotation breakdown
material recommendations
labor calculations
total estimate
customer information
31. NOTIFICATION SYSTEM (OPTIONAL)

Users can receive notifications for:

quotation sent
quotation approved
production started
installation scheduled
completed orders
32. RECOMMENDED API STRUCTURE
/api/orders
/api/orders/:id
/api/orders/:id/approve
/api/orders/:id/cancel
/api/orders/:id/files
/api/orders/:id/progress
33. SERVICE LAYER STRUCTURE
services/

order.service.ts
quotation.service.ts
material.service.ts
labor.service.ts
pdf.service.ts
notification.service.ts
34. CONTROLLER STRUCTURE
controllers/

order.controller.ts
quotation.controller.ts
35. VALIDATIONS

Validate:

measurements
quotation totals
status transitions
uploaded files
user ownership
36. ERROR HANDLING

Return consistent API responses.

Example
{
  "success": false,
  "message": "Order not found"
}
37. DATABASE INDEXING

Recommended indexes:

orderId
customerId
status
createdAt
38. FRONTEND INTEGRATION REQUIREMENTS

Backend must support:

overview cards
filters
order tables
detail drawers
quotation downloads
service requests
39. FUTURE SCALABILITY

Architecture should support:

payment integration
live fabrication updates
technician tracking
delivery tracking
mobile apps
40. DEVELOPMENT PHASES
PHASE 1
schemas
order CRUD
status workflow
PHASE 2
quotation system
material storage
labor calculations
PHASE 3
file uploads
PDF generation
PHASE 4
search & filters
pagination
PHASE 5
notifications
analytics
optimization
41. FINAL BACKEND OBJECTIVE

The backend should behave as:

"a scalable fabrication workflow management system"

NOT:

"a simple CRUD backend"

42. SUMMARY

This backend module manages:

fabrication orders
quotation workflows
material calculations
labor calculations
progress tracking
PDFs & invoices
service integrations
scalable frontend integration

while maintaining:

clean architecture
modular services
secure APIs
mock-to-real data scalability
realistic fabrication workflows