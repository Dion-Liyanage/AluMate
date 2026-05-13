AluMate – User Dashboard My Orders Page Frontend Development Plan
Order Tracking & Order Management Interface
Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the frontend implementation plan for the:

User Dashboard → My Orders Page

The goal of this module is to allow users to:

view all fabrication orders
track quotation progress
monitor fabrication status
view installation progress
access order details
manage quotations and payments

while maintaining the same:

dark glassmorphism UI
neon gradient cards
dashboard layout consistency
smooth animations
responsive behavior

used throughout the AluMate system.

1. PAGE OBJECTIVE

The My Orders page should function as:

a centralized order tracking dashboard

for residential customers.

2. PAGE ROUTE
/dashboard/orders
3. PAGE LAYOUT STRUCTURE
Recommended Layout
-------------------------------------------------

Sidebar

Top Navigation

-------------------------------------------------

Page Header

-------------------------------------------------

Order Overview Cards

-------------------------------------------------

Search & Filter Section

-------------------------------------------------

Orders Table / Cards

-------------------------------------------------

Order Details Drawer / Modal

-------------------------------------------------
4. PAGE HEADER SECTION
Header Content
Title
My Orders
Subtitle
Track fabrication progress, quotations, payments, and delivery updates.
5. ORDER OVERVIEW CARDS
Main Goal

Display quick statistics.

Recommended Cards
Total Orders
All orders created by user
Active Orders
Currently processing orders
Pending Quotations
Orders waiting for quotation approval
Completed Orders
Successfully completed projects
Service Requests
Associated repair/on-site services
6. OVERVIEW CARD DESIGN

Follow existing dashboard design:

gradient backgrounds
glassmorphism effects
rounded corners
neon borders
glowing icons
hover lift animations
Suggested Colors
Card	Theme
Total Orders	Blue
Active Orders	Orange
Quotations	Purple
Completed	Green
Services	Cyan
7. SEARCH & FILTER SECTION
Main Goal

Allow users to quickly locate orders.

Search Bar

Search by:

Order ID
Product Type
Quotation ID
Filters
Status Filter
All
Pending
Quotation Sent
Approved
In Production
Installing
Completed
Cancelled
Product Type Filter
Window
Door
Pantry
Partition
Cupboard
Date Filter
Newest
Oldest
Recent 30 Days
8. ORDER LIST SECTION
Recommended Layout

Desktop:

Modern data table layout

Mobile:

Stacked order cards
9. ORDER TABLE COLUMNS
Recommended Columns
Column	Description
Order ID	Unique order identifier
Product Type	Window / Door / Pantry
Design Type	Custom / Catalogue
Order Date	Submission date
Estimated Price	Estimated quotation
Status	Current workflow status
Progress	Progress bar
Action	View details button
10. ORDER STATUS SYSTEM
Recommended Statuses
Draft
Quotation Pending
Quotation Sent
Approved
In Production
Installation Scheduled
Completed
Cancelled
11. STATUS BADGE DESIGN
Use Colored Pills
Status	Color
Draft	Gray
Pending	Orange
Approved	Blue
Production	Purple
Completed	Green
Cancelled	Red
Animation Recommendation

Use:

subtle glow pulse
smooth transitions
hover scaling
12. ORDER PROGRESS TRACKER
Recommended Progress UI

Each order should display:

Progress Percentage
Workflow Stage
Example
Quotation Approved → 25%

Fabrication Started → 50%

Installation Scheduled → 75%

Completed → 100%
13. ORDER DETAILS VIEW
Recommended UI

Use:

Right-side drawer

OR:

fullscreen modal
14. ORDER DETAILS CONTENT
Basic Information
Order ID
Customer Name
Created Date
Expected Completion
Product Information
Product Type
Measurements
Purpose
Selected Color
Strength Category
Recommended Materials Section

Display:

Recommended Aluminium Profiles
Accessories
Glass Types
15. MATERIAL COST BREAKDOWN
Display
Item	Quantity	Price
80mm Sliding	22ft	Rs. 35,200
Tempered Glass	18sq.ft	Rs. 14,000
16. LABOR COST BREAKDOWN
Display
Area:
24 sq.ft

Labor Rate:
Rs. 350 / sq.ft

Total Labor:
Rs. 8,400
17. QUOTATION SUMMARY SECTION
Display
Type	Amount
Material Cost	Rs. XX
Labor Cost	Rs. XX
Installation	Rs. XX
Transport	Rs. XX
Total Estimate	Rs. XX
18. FILES & ATTACHMENTS SECTION

Allow viewing:

quotation PDFs
design previews
uploaded references
invoices
19. ORDER ACTION BUTTONS
Recommended Buttons
View Details
Opens order details drawer
Download Quotation
Download quotation PDF
Accept Quotation
Approve quotation request
Cancel Order
Cancel pending order
Request Service
Create repair/service request
20. SAVED DESIGNS SECTION (OPTIONAL)

Users can save unfinished designs.

Display
Design Preview
Last Modified Date
Continue Designing Button
21. EMPTY STATE DESIGN

If no orders exist:

Display Illustration
No Orders Yet
CTA Button
Create Your First Design
22. LOADING STATES

Use:

skeleton loaders
shimmer animations
glowing placeholders

consistent with dashboard theme.

23. ERROR STATES

Display friendly messages:

Unable to load orders
Try again
24. FRONTEND STATE MANAGEMENT
Recommended States
orders
selectedOrder
filters
searchQuery
statusFilter
loading
pagination
25. RECOMMENDED COMPONENT STRUCTURE
components/dashboard/orders/

OrdersOverviewCards.tsx
OrdersSearchFilters.tsx
OrdersTable.tsx
OrderStatusBadge.tsx
OrderProgressTracker.tsx
OrderDetailsDrawer.tsx
QuotationSummary.tsx
MaterialBreakdown.tsx
LaborBreakdown.tsx
EmptyOrdersState.tsx
26. RESPONSIVE DESIGN REQUIREMENTS
Desktop
full table layout
side detail drawer
overview cards row
Tablet
compact tables
collapsible filters
Mobile
stacked order cards
fullscreen order details
simplified filters
27. UI/UX REQUIREMENTS

Follow existing AluMate design language:

dark UI
neon gradients
glassmorphism panels
rounded cards
glowing hover effects
sidebar consistency
smooth transitions
28. ANIMATION REQUIREMENTS
Recommended Animations
Page Load
fade-up stagger animations
Cards
hover lift + glow effect
Tables
smooth row hover highlight
Modals / Drawers
slide-in transition
29. VALIDATION REQUIREMENTS

Users should only be able to:

cancel pending orders
approve quotations
request services for completed orders
30. DEVELOPMENT PHASES
PHASE 1
Page layout
Overview cards
Table UI
PHASE 2
Search & filtering
Status badges
PHASE 3
Order details drawer
Material breakdown
PHASE 4
Quotation summary
Download actions
PHASE 5
Animations
Responsive optimization
31. FINAL FRONTEND OBJECTIVE

The My Orders page should behave as:

a modern residential fabrication order tracking system

NOT:

a simple CRUD table
32. SUMMARY

This module allows users to:

track fabrication orders
monitor quotations
view material recommendations
understand labor calculations
access quotations and invoices
monitor project progress
manage completed services

while maintaining:

modern dashboard aesthetics
scalable architecture
smooth UX
responsive layouts
intelligent workflow visibility