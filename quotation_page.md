user-dashboard-quotations-frontend-ui-plan.md
# AluMate – User Dashboard Quotations Page Frontend Development Plan
## Quotation Management & Estimation Interface

---

# Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the frontend UI implementation plan for:

User Dashboard → Quotations Page

The purpose of this module is to allow users to:

- view all quotations
- review quotation breakdowns
- understand material calculations
- review labor costs
- approve/reject quotations
- download quotation PDFs
- monitor quotation statuses
- track quotation revisions

while maintaining:

- dark dashboard UI
- glassmorphism styling
- neon gradient effects
- responsive layouts
- smooth animations
- scalable frontend architecture

---

# 1. PAGE OBJECTIVE

The Quotations page should function as:

"a centralized quotation review and approval dashboard"

for residential aluminium fabrication customers.

---

# 2. PAGE ROUTE

/dashboard/quotations

---

# 3. PAGE LAYOUT STRUCTURE

-------------------------------------------------

Sidebar

Top Navigation

-------------------------------------------------

Page Header

-------------------------------------------------

Quotation Overview Cards

-------------------------------------------------

Search & Filter Section

-------------------------------------------------

Quotation Table / Cards

-------------------------------------------------

Quotation Details Drawer / Modal

-------------------------------------------------

PDF Preview & Download Section

-------------------------------------------------

---

# 4. PAGE HEADER SECTION

## Header Title

Quotations

---

## Subtitle

Review quotations, material breakdowns, labor costs, and approve your fabrication estimates.

---

# 5. QUOTATION OVERVIEW CARDS

## Main Goal

Display quotation statistics.

---

## Recommended Cards

### Total Quotations

All generated quotations

---

### Pending Approval

Waiting for customer approval

---

### Approved Quotations

Accepted quotations

---

### Rejected Quotations

Declined quotations

---

### Draft Quotations

Under admin review

---

# 6. CARD DESIGN SYSTEM

Follow existing dashboard UI style:

- glassmorphism panels
- neon gradients
- rounded corners
- glowing icons
- hover lift effects
- animated highlights

---

## Suggested Colors

| Card | Theme |
|---|---|
| Total Quotations | Blue |
| Pending | Orange |
| Approved | Green |
| Rejected | Red |
| Draft | Purple |

---

# 7. SEARCH & FILTER SECTION

## Search Features

Search by:

- Quotation ID
- Order ID
- Product Type

---

## Filters

### Status Filter

- All
- Draft
- Pending Approval
- Approved
- Rejected
- Expired

---

### Product Type Filter

- Window
- Door
- Pantry
- Partition
- Cupboard
- Railing

---

### Date Filter

- Latest
- Oldest
- Last 30 Days

---

# 8. QUOTATION LIST SECTION

## Recommended Layout

Desktop:

Modern quotation table

---

Mobile:

Stacked quotation cards

---

# 9. QUOTATION TABLE COLUMNS

| Column | Description |
|---|---|
| Quotation ID | Unique quotation identifier |
| Order ID | Related order |
| Product Type | Product category |
| Estimated Amount | Total quotation value |
| Status | Approval status |
| Created Date | Quotation generated date |
| Expiry Date | Quotation validity |
| Action | View details |

---

# 10. QUOTATION STATUS SYSTEM

## Recommended Statuses

- Draft
- Pending Approval
- Approved
- Rejected
- Expired

---

# 11. STATUS BADGE DESIGN

Use:

- glowing pill badges
- neon border highlights
- hover animations

---

## Suggested Colors

| Status | Color |
|---|---|
| Draft | Purple |
| Pending | Orange |
| Approved | Green |
| Rejected | Red |
| Expired | Gray |

---

# 12. QUOTATION DETAILS VIEW

## Recommended UI

Use:

Right-side drawer

OR:

fullscreen modal

---

# 13. QUOTATION DETAILS CONTENT

## Basic Information

- Quotation ID
- Order ID
- Product Type
- Design Type
- Generated Date
- Expiry Date

---

## Customer Inputs Section

Display:

- measurements
- purpose
- environment
- selected colors
- strength category

---

# 14. DESIGN PREVIEW SECTION

Display:

- 2D preview image
- 3D rendered preview
- catalogue preview image

---

# 15. MATERIAL BREAKDOWN PANEL

## Main Goal

Allow users to understand material recommendations.

---

## Display

| Material | Qty | Rate | Total |
|---|---|---|---|
| 80mm Sliding | 22ft | Rs.1600 | Rs.35,200 |
| Tempered Glass | 18sq.ft | Rs.700 | Rs.12,600 |

---

# 16. MATERIAL RECOMMENDATION EXPLANATION

Display reasons for selected materials.

---

## Example

Selected because:

- Large dimensions detected
- Heavy usage selected
- Outdoor environment selected

---

# 17. LABOR COST BREAKDOWN PANEL

Display:

- calculated area
- labor rate
- labor total

---

## Example

Area:
24 sq.ft

Labor Rate:
Rs.350 / sq.ft

Labor Cost:
Rs.8,400

---

# 18. QUOTATION SUMMARY PANEL

## Display

| Type | Amount |
|---|---|
| Material Cost | Rs.XX |
| Labor Cost | Rs.XX |
| Installation | Rs.XX |
| Transport | Rs.XX |
| Total Estimate | Rs.XX |

---

# 19. IMPORTANT NOTICE SECTION

Display:

```text
Final measurements may slightly affect
the final quotation amount.
20. QUOTATION PDF SECTION

Allow users to:

preview PDF
download PDF
print quotation
21. ACTION BUTTONS
Recommended Actions
View Details

Open quotation drawer

Download PDF

Download quotation file

Approve Quotation

Accept quotation

Reject Quotation

Decline quotation

Contact Admin

Open support/chat

22. APPROVAL CONFIRMATION MODAL

Before approving:

Display:

quotation total
payment notice
production notice
Example
Approving this quotation will begin
the fabrication process.
23. REJECTION FLOW

Users may provide:

rejection reason
modification requests
budget concerns
24. EMPTY STATE DESIGN

If no quotations exist:

Display:

"No Quotations Available"

CTA Button

Create New Design

25. LOADING STATES

Use:

skeleton loaders
shimmer placeholders
animated cards

consistent with dashboard theme.

26. ERROR STATES

Display:

Unable to load quotations

Try again

27. FRONTEND STATE MANAGEMENT
Recommended States
quotations
selectedQuotation
filters
searchQuery
statusFilter
loading
quotationModal
pagination
28. RECOMMENDED COMPONENT STRUCTURE

components/dashboard/quotations/

QuotationsOverviewCards.tsx
QuotationsSearchFilters.tsx
QuotationsTable.tsx
QuotationStatusBadge.tsx
QuotationDetailsDrawer.tsx
MaterialBreakdown.tsx
LaborBreakdown.tsx
QuotationSummary.tsx
PdfPreviewPanel.tsx
EmptyQuotationState.tsx
29. RESPONSIVE DESIGN REQUIREMENTS
Desktop
advanced table layout
side detail drawer
multiple breakdown panels
Tablet
collapsible filters
compact quotation cards
Mobile
stacked quotation cards
fullscreen detail views
simplified actions
30. UI/UX REQUIREMENTS

Follow existing AluMate design system:

dark dashboard theme
neon gradients
glassmorphism cards
glowing hover effects
rounded corners
smooth transitions
sidebar consistency
31. ANIMATION REQUIREMENTS
Recommended Animations
Page Load

fade-up stagger animations

Cards

hover glow + lift effects

Tables

smooth row hover highlight

Drawers / Modals

slide-in animations

Status Changes

animated badge transitions

32. MOCK DATA ARCHITECTURE

Frontend components should NEVER directly contain mock data.

Instead use:

UI Components
↓
Hooks
↓
Service Layer
↓
Mock Data / API

This allows:

easy backend integration
scalable architecture
no UI rewrites
33. RECOMMENDED PROJECT STRUCTURE

src/

mock/
quotations.mock.ts

services/
quotation.service.ts

hooks/
useQuotations.ts

types/
quotation.types.ts

components/
dashboard/quotations/

34. VALIDATION REQUIREMENTS

Users should only:

approve pending quotations
reject valid quotations
download authorized quotation files
35. DEVELOPMENT PHASES
PHASE 1
layout
overview cards
quotation table
PHASE 2
filters
status badges
detail drawer
PHASE 3
material breakdown
labor calculations
quotation summary
PHASE 4
PDF preview
approval workflow
PHASE 5
animations
responsive optimization
36. FINAL FRONTEND OBJECTIVE

The Quotations page should behave as:

"a professional quotation review and approval system"

NOT:

"a simple quotation list"

37. SUMMARY

This module allows users to:

review fabrication quotations
understand material recommendations
monitor labor calculations
download quotation PDFs
approve/reject quotations
communicate with admins

while maintaining:

scalable architecture
modern UI consistency
realistic quotation workflows
intelligent estimation visibility