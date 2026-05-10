AluMate – User Dashboard Frontend Development Plan
Intelligent Quotation & Product Configuration System
Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the complete frontend implementation plan for the User Dashboard Quotation Input System.

The goal of this module is to allow residential customers to:

create their own aluminium designs
configure pre-designed catalogue products
enter measurements and requirements
generate smart quotation requests

This document is detailed enough for a developer to implement the frontend system directly.

1. MODULE OVERVIEW

The quotation input system is divided into:

1. Create Your Own Design
2. Design Catalogue Products

Both modules eventually connect to the same quotation generation workflow.

2. USER FLOW OVERVIEW
CREATE CUSTOM DESIGN FLOW
Select Product Type
        ↓
Open Design Workspace
        ↓
Create Custom Design
        ↓
Add Measurements & Requirements
        ↓
Live Estimation
        ↓
Submit Quotation Request
DESIGN CATALOGUE FLOW
Open Catalogue
        ↓
Select Pre-Designed Product
        ↓
View Design
        ↓
Add Measurements & Requirements
        ↓
Live Estimation
        ↓
Submit Quotation Request
3. USER DASHBOARD NAVIGATION
Sidebar Structure
Dashboard

DESIGN
├── New Design
├── Design Catalogue

ORDERS
├── My Orders
├── Quotations

SERVICES
├── On-Site Visit
├── Repairs
4. CREATE YOUR OWN DESIGN PAGE
Route
/dashboard/design/new
5. PAGE OBJECTIVE

This page allows users to:

select a product type
create a fully custom design
configure measurements and requirements
generate quotation requests
6. PAGE LAYOUT STRUCTURE
Recommended Layout
-------------------------------------------------
Sidebar

Top Navigation

-------------------------------------------------

Product Selection Section

-------------------------------------------------

Design Workspace

-------------------------------------------------

Configuration Panel

-------------------------------------------------

Live Estimation Panel

-------------------------------------------------

Submit Section
7. PRODUCT TYPE SELECTION
UI Type

Use selectable product cards.

Example Product Types
Window
Door
Pantry
Cupboard
Partition
Railing
Other
Product Card Information

Each card should contain:

icon/image
product name
short description
select button
8. DESIGN WORKSPACE SECTION
Main Purpose

This section contains the:

2D Design Canvas
3D Preview Canvas

using:

Fabric.js
Three.js
9. WORKSPACE LAYOUT
Recommended Layout
-------------------------------------------------
Toolbar

2D / 3D Toggle

-------------------------------------------------

Canvas Area

-------------------------------------------------

Properties Panel
10. 2D / 3D TOGGLE
Feature

Allow users to switch between:

2D Design View
3D Visualization
Important UX Recommendation

When switching:

canvas should expand to full width
maximize workspace area
hide unnecessary panels
11. DESIGN TOOLBAR
Initial Tools
Move
Select
Delete
Zoom
Reset View
Snap Alignment
12. SHAPE / PROFILE PANEL

Initially:

placeholder cards

Later:

real aluminium profile components
Important Recommendation

DO NOT hardcode final industrial profiles initially.

Use:

modular profile cards

so future aluminium models can replace them easily.

13. CONFIGURATION PANEL
IMPORTANT SECTION

This section directly affects quotation generation.

14. CONFIGURATION PANEL LAYOUT
Measurements
Purpose
Environment
Strength
Colors & Finish
Accessories
Additional Notes
15. MEASUREMENT INPUTS
Dynamic Fields

Measurements should change depending on:

selected product type
Example Inputs
Pantry
Width
Height
Depth
Compartment Count
Window
Width
Height
Panel Count
Sliding/Fixed
Door
Width
Height
Opening Direction
Lock Type
16. PURPOSE SELECTION
VERY IMPORTANT FIELD

This directly affects:

material selection
profile thickness
accessories
quotation value
Example Options
Pantry
Light Home Usage
Standard Family Usage
Heavy Kitchen Usage
Luxury Interior Usage
Window
Bedroom Window
Kitchen Window
Large Hall Window
Outdoor Exposure
17. ENVIRONMENT SELECTION
Options
Indoor
Outdoor
Wet Area
High Sun Exposure
18. STRENGTH CATEGORY
Options
Light Duty
Medium Duty
Heavy Duty
UX Recommendation

Show:

small explanation tooltips

for each strength category.

19. COLOR & FINISH SECTION
Options
Black
White
Silver
Champagne Gold
Wood Finish
Custom Color
20. ACCESSORIES SECTION
Dynamic Options

Show options based on product type.

Examples:

Handles
Locks
Rails
Glass Types
Hinges
21. LIVE ESTIMATION PANEL
Main Goal

Provide:

estimated quotation preview

NOT final quotation.

Display Items
Estimated Material Category
Estimated Material Cost
Estimated Labor Cost
Estimated Installation Cost
Estimated Total
Important Note

Display warning:

Final quotation will be reviewed by admin.
22. SUBMIT QUOTATION SECTION
Button
Generate Quotation Request
Submission Data

Frontend should submit:

design data
measurements
selected options
quotation requirements
23. DESIGN CATALOGUE PAGE
Route
/dashboard/design/catalogue
24. PAGE OBJECTIVE

Allow users to:

browse pre-designed products
configure measurements
request quotations

WITHOUT editing the actual design structure.

25. CATALOGUE PAGE LAYOUT
-------------------------------------------------
Search / Filter

-------------------------------------------------

Product Cards Grid

-------------------------------------------------
26. PRODUCT CARD DESIGN

Each card should contain:

preview image
product name
category
short description
view details button
27. PRODUCT DETAILS PAGE
Route
/dashboard/design/catalogue/[id]
28. IMPORTANT RULE

Users CAN:

change measurements
change colors
change requirements

Users CANNOT:

edit design structure/layout
29. PRODUCT DETAILS LAYOUT
Product Preview

Measurements Panel

Requirements Panel

Live Estimation

Quotation Submission
30. FRONTEND STATE MANAGEMENT
Recommended States
selectedProduct
designData
measurements
purpose
environment
strength
selectedAccessories
estimatedCost
31. RECOMMENDED COMPONENT STRUCTURE
components/dashboard/design/

ProductTypeSelector.tsx
DesignToolbar.tsx
CanvasWorkspace.tsx
MeasurementForm.tsx
PurposeSelector.tsx
EnvironmentSelector.tsx
StrengthSelector.tsx
ColorSelector.tsx
AccessoriesSelector.tsx
LiveEstimatePanel.tsx
QuotationSummary.tsx
32. RESPONSIVE DESIGN REQUIREMENTS
Desktop
split layout
side panels
large canvas area
Tablet
collapsible panels
stacked layout
Mobile
simplified configuration flow
step-by-step wizard layout
33. UI/UX REQUIREMENTS

Follow existing AluMate design language:

dark UI
neon gradients
rounded cards
glassmorphism effects
smooth animations
sidebar consistency
34. VALIDATION REQUIREMENTS
Required Inputs
Product Type
Measurements
Purpose
Strength Category
Optional Inputs
Additional Notes
Accessories
Custom Color
35. RECOMMENDED DEVELOPMENT PHASES
PHASE 1
Product selection UI
Basic layout
Static forms
PHASE 2
Fabric.js integration
2D workspace
PHASE 3
Three.js integration
3D preview
PHASE 4
Dynamic configuration panels
PHASE 5
Live estimation UI
PHASE 6
API integration
Submission flow
36. FINAL FRONTEND OBJECTIVE

The frontend should behave as:

an intelligent residential aluminium product configurator

NOT:

a complex industrial CAD system
37. SUMMARY

This frontend system allows users to:

design custom aluminium products
configure pre-designed catalogue items
enter realistic fabrication requirements
receive smart quotation estimations
submit structured quotation requests

while maintaining:

clean UX
scalable architecture
modern UI consistency
realistic residential fabrication workflows