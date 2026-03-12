AluMate Admin Dashboard UI Design Plan
Project

AluMate – Web-based Aluminium Fabrication and Service Management System

This document defines the Admin Dashboard UI architecture aligned with the updated User Dashboard workflow.

The admin dashboard is designed for aluminium fabrication companies to manage:

customer orders

quotations

product designs

service requests

inventory

analytics

announcements

The admin panel functions as the business operations control center of the AluMate platform.

1. Admin Dashboard Philosophy

The Admin Dashboard must support the complete fabrication workflow.

Admin workflow:

Customer places order
        ↓
Admin reviews design
        ↓
Admin generates quotation
        ↓
Customer confirms order
        ↓
Fabrication begins
        ↓
Admin tracks progress
        ↓
Order completed

The dashboard should provide quick access to these steps.

2. Admin Dashboard Layout Structure
--------------------------------------------------------
Sidebar           | Topbar (notifications | admin info)
                  |
                  | Business Overview
                  |
                  | Statistics Cards
                  |
                  | Orders Overview
                  |
                  | Quick Links
                  |
                  | Recent Activity
--------------------------------------------------------
3. Admin Sidebar Navigation

The sidebar should expose all business management features.

Dashboard

Orders
    All Orders
    Pending Orders
    Active Orders
    Completed Orders

Quotations
    Pending Quotations
    Approved Quotations

Customers

Design Catalogue
    Manage Designs
    Add New Design

Inventory
    Materials
    Stock Levels

Services
    Measurement Requests
    Maintenance Requests

Projects
    Completed Projects

Analytics

Announcements

Messages

Profile
4. Admin Dashboard Home

Route:

/admin

Purpose:
Provide a complete overview of business operations.

4.1 Business Overview Section

Header text:

Business Overview
Monitor your aluminium fabrication business at a glance.
4.2 Statistics Cards

Display key metrics.

Total Orders
Revenue
Active Customers
Pending Quotations
Low Stock Items
Service Requests

Card structure:

+----------------------------+
| Icon                       |
| Metric Name                |
| Value                      |
| Growth Indicator           |
+----------------------------+
5. Orders Overview Section

Purpose:
Allow admin to quickly monitor orders.

Orders Overview

Recent Orders Table

Table fields:

Order ID
Customer Name
Product Type
Design Type
Status
Quotation Status
Date
Actions

Actions:

View
Generate Quotation
Update Status
6. Quick Links Section

Quick access to important actions.

Create Quotation
Add New Design
View Pending Orders
Check Inventory
7. Orders Management Page

Route:

/admin/orders

Purpose:
Admin manages fabrication orders.

Orders Table
Order ID
Customer
Product Type
Design Type
Dimensions
Status
Quotation
Actions

Status types:

Pending
Quotation Sent
Confirmed
In Fabrication
Completed
Cancelled
8. Quotation Management

Route:

/admin/quotations

Purpose:
Generate quotations for customer orders.

Quotation Workflow
Customer submits order
        ↓
Admin reviews order
        ↓
Admin calculates materials
        ↓
Admin generates quotation
        ↓
Customer accepts / rejects
Quotation Page Layout
Quotation Details

Customer Information
Order Details
Design Preview

Material Cost
Labor Cost
Additional Costs

Total Price

Generate PDF Quotation
Send to Customer
9. Customers Management

Route:

/admin/customers

Purpose:
Manage registered customers.

Customers Table
Customer Name
Email
Phone
Total Orders
Active Orders
Actions

Actions:

View Profile
View Orders
Send Message
10. Design Catalogue Management

Route:

/admin/designs

Purpose:
Admin manages pre-designed aluminium products.

These designs appear in the User Design Catalogue.

Design Catalogue Table
Design Name
Category
Material
Preview Image
Status
Actions

Actions:

Edit
Delete
Preview
Add New Design Page
Upload Design Image

Design Name
Category
Description
Material Type
Color Options

Save Design
11. Inventory Management

Route:

/admin/inventory

Purpose:
Track aluminium fabrication materials.

Inventory Table
Material Name
Category
Stock Quantity
Minimum Level
Status
Actions

Status types:

In Stock
Low Stock
Out of Stock
12. Services Management

Route:

/admin/services

Purpose:
Manage service requests.

Examples:

On-site measurement
Repairs
Maintenance
Service Requests Table
Request ID
Customer
Service Type
Location
Status
Date
Actions
13. Completed Projects Management

Route:

/admin/projects

Purpose:
Add completed projects to User Project Gallery.

Add Project Page

Fields:

Project Title
Description
Location
Material Used
Upload Images
14. Analytics Dashboard

Route:

/admin/analytics

Displays charts such as:

Monthly Revenue
Order Trends
Customer Growth
Popular Product Types

Charts implemented using:

Recharts
15. Announcements System

Route:

/admin/announcements

Purpose:
Send platform announcements to users.

Examples:

Holiday notice
Discount promotions
Maintenance updates
16. Messaging System

Route:

/admin/messages

Allows communication with customers.

Example uses:

Quotation discussion
Design clarification
Measurement scheduling

Real-time messaging can be implemented using:

Socket.IO
17. Admin UI Component Architecture

Suggested component structure.

components/

admin/

dashboard/
    AdminStatsCards.tsx
    OrdersOverview.tsx
    QuickLinks.tsx

orders/
    OrdersTable.tsx
    OrderDetails.tsx

quotations/
    QuotationForm.tsx
    QuotationTable.tsx

customers/
    CustomersTable.tsx

designs/
    DesignTable.tsx
    AddDesignForm.tsx

inventory/
    InventoryTable.tsx

services/
    ServiceRequestsTable.tsx

projects/
    ProjectForm.tsx
18. Admin Dashboard Key Features

Core capabilities:

Manage Orders
Generate Quotations
Track Inventory
Manage Customers
Publish Designs
Manage Projects
Monitor Analytics
Send Announcements
Handle Service Requests
19. Development Order (Recommended)

Implement admin UI in this order.

Phase 1

Orders Management

Quotation System

Customer Management

Phase 2

Design Catalogue Management

Inventory Management

Phase 3

Service Requests

Projects Management

Phase 4

Analytics Dashboard

Announcements

Messaging

20. Relationship Between User and Admin Dashboards
User designs product
        ↓
User places order
        ↓
Admin reviews order
        ↓
Admin generates quotation
        ↓
User confirms order
        ↓
Admin processes fabrication

This ensures the full lifecycle of aluminium fabrication services is digitized.

21. Final Goal

The Admin Dashboard should function as a fabrication business management system, enabling aluminium companies to efficiently manage:

orders

designs

quotations

materials

services

customer communication

This transforms AluMate into a complete digital aluminium fabrication service platform.