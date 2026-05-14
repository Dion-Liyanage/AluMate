AluMate – User Dashboard Quotations Page (Revised)
Frontend UI Development Plan
Quotation Review & Approval Center
Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the revised frontend implementation plan for:

User Dashboard → Quotations Page

This revised structure focuses ONLY on:

quotation review
cost transparency
material recommendations
quotation approval workflow
quotation comparison
modification requests

while avoiding duplication with:

My Orders page
Dashboard tracking
Production workflow sections
1. MODULE OBJECTIVE

The Quotations page should behave as:

“A professional quotation review and approval center”

NOT:

an order tracking page
a production management page
a duplicate order history page
2. PRIMARY USER GOALS

Users should be able to:

review quotation pricing
understand material selection
compare quotations
approve quotations
request modifications
download quotation PDFs
3. PAGE ROUTE
/dashboard/quotations
4. PAGE LAYOUT STRUCTURE
-------------------------------------------------

Sidebar Navigation

Top Navbar

-------------------------------------------------

Page Header

-------------------------------------------------

Mini Overview Cards

-------------------------------------------------

Search & Filters

-------------------------------------------------

Quotation List

-------------------------------------------------

Quotation Details Drawer / Modal

-------------------------------------------------
5. PAGE HEADER SECTION
Title
Quotations
Subtitle
Review, compare, and approve your fabrication quotations.
6. MINI OVERVIEW CARDS

Keep this section lightweight.

Only include:

Card	Purpose
Pending Approval	Waiting for customer action
Approved	Accepted quotations
Expired	Expired quotations
7. UI DESIGN STYLE

Follow existing AluMate dashboard styling:

dark glassmorphism UI
neon gradients
glowing hover effects
rounded corners
subtle blur backgrounds
animated transitions
dashboard consistency
8. SEARCH & FILTER SECTION
Search Inputs

Allow searching by:

quotation ID
product type
design name
Filters
Status Filter
All
Pending
Approved
Expired
Revision Requested
Product Type Filter
Windows
Doors
Pantry
Partition
Cupboard
Railings
Design Type Filter
Custom Design
Catalogue Design
9. MAIN QUOTATION LIST

This becomes the primary section.

Use:

Desktop

Modern responsive table

Mobile

Stacked quotation cards

10. TABLE COLUMNS
Column	Description
Quote ID	Unique quotation reference
Product	Product category
Design Type	Custom / Catalogue
Estimated Total	Final estimate
Status	Approval status
Generated Date	Creation date
Expiry Date	Validity period
Action	View quotation
11. STATUS BADGES

Use glowing pill badges.

Status	Color
Pending	Orange
Approved	Green
Expired	Gray
Revision Requested	Purple
12. QUOTATION DETAILS VIEW
Recommended UI

Use:

slide drawer
OR
fullscreen modal
13. QUOTATION DETAILS STRUCTURE
SECTION 1 — PRODUCT PREVIEW

Display:

product image
2D design preview
3D preview image
design type
measurements summary
SECTION 2 — CUSTOMER INPUTS

Display:

Field	Example
Width	8ft
Height	7ft
Color	Matte Black
Usage Purpose	Heavy Daily Use
Environment	Outdoor
14. COST BREAKDOWN SECTION

This becomes one of the MOST IMPORTANT sections.

Breakdown Table
Type	Cost
Aluminium Profiles	Rs.XX
Glass	Rs.XX
Accessories	Rs.XX
Labor	Rs.XX
Installation	Rs.XX
Transport	Rs.XX
15. MATERIAL RECOMMENDATION SECTION
Main Goal

Explain WHY certain materials were selected.

Example Display
Recommended Materials
80mm Sliding Profile
Tempered Glass
Heavy-duty rollers
Recommendation Reason
Selected because:
• Large dimensions detected
• Heavy usage selected
• Outdoor installation environment
16. ALTERNATIVE MATERIAL OPTIONS

This is a VERY strong feature.

Display:

Option Type	Material
Budget Option	70mm Sliding
Standard Option	80mm Sliding
Premium Option	Heavy-duty 100mm System
Purpose

Allows users to:

reduce budget
increase durability
compare options
17. LABOR COST SECTION

Display:

Item	Value
Calculated Area	XX sq.ft
Labor Rate	Rs.350 / sq.ft
Labor Total	Rs.XX
18. QUOTATION SUMMARY PANEL
Final Summary
Category	Amount
Material Cost	Rs.XX
Labor Cost	Rs.XX
Installation	Rs.XX
Transport	Rs.XX
Grand Total	Rs.XX
19. IMPORTANT NOTICE SECTION
Final measurements and site conditions may slightly affect the final quotation amount.
20. QUOTATION VERSION HISTORY

Highly recommended feature.

Example
Version	Total	Date
V1	Rs.120,000	Jan 12
V2	Rs.110,000	Jan 15
V3	Rs.98,000	Jan 18
Purpose

Allows users to:

compare revisions
understand pricing changes
review admin modifications
21. MAIN ACTION BUTTONS

Only include:

Action	Purpose
Approve Quotation	Confirm quotation
Request Modification	Ask for changes
Download PDF	Save quotation
22. REQUEST MODIFICATION FLOW

Instead of:

Reject Quotation

Use:

Request Modification

This is much more realistic.

Example Requests
reduce budget
change color
replace profile type
reduce glass quality
simplify design
23. APPROVAL CONFIRMATION MODAL

Before approval:

Display:

Approving this quotation will begin
the fabrication process.

Include:

quotation total
payment reminder
production notice
24. PDF SECTION

Users should be able to:

preview PDF
download PDF
print quotation
25. EMPTY STATE DESIGN

If no quotations exist:

No Quotations Available

CTA:

Create New Design
26. LOADING STATES

Use:

skeleton loaders
shimmer effects
animated placeholders
27. RESPONSIVE DESIGN REQUIREMENTS
Desktop
advanced table layout
slide drawer
side-by-side breakdown panels
Tablet
collapsible filters
compact quotation cards
Mobile
stacked cards
fullscreen detail modal
simplified actions
28. RECOMMENDED COMPONENT STRUCTURE
components/dashboard/quotations/

QuotationsOverviewCards.tsx
QuotationFilters.tsx
QuotationTable.tsx
QuotationCard.tsx
QuotationStatusBadge.tsx
QuotationDetailsDrawer.tsx
CostBreakdown.tsx
MaterialRecommendation.tsx
AlternativeMaterials.tsx
LaborCostPanel.tsx
QuotationSummary.tsx
VersionHistory.tsx
PdfPreview.tsx
EmptyQuotationState.tsx
29. RECOMMENDED STATE MANAGEMENT
quotations
selectedQuotation
filters
searchQuery
statusFilter
loading
quotationDrawer
comparisonMode
revisionRequest
30. MOCK DATA ARCHITECTURE

Frontend components should NEVER directly contain mock data.

Use:

UI Components
↓
Hooks
↓
Service Layer
↓
Mock Data / Backend API

This ensures:

clean backend integration
scalable architecture
easy transition to production
31. ANIMATION REQUIREMENTS
Recommended Animations
Page Load
stagger fade-up animation
Cards
glow hover
slight lift effect
Drawer
smooth slide animation
Buttons
neon hover transitions
Status Changes
animated badge transitions
32. DEVELOPMENT PHASES
PHASE 1
page layout
mini overview cards
quotation table
PHASE 2
filters
status badges
responsive cards
PHASE 3
quotation details drawer
cost breakdown
material recommendation panels
PHASE 4
quotation comparison
version history
alternative materials
PHASE 5
PDF preview
approval workflow
modification requests
PHASE 6
animations
responsive optimization
final polish
33. FINAL OBJECTIVE

The revised Quotations page should feel like:

“A professional estimation and quotation approval system”

focused on:

transparency
recommendations
customer decision-making
realistic fabrication workflow

without duplicating:

order tracking
production workflow
installation monitoring

which are already handled inside:

My Orders page
Dashboard modules.