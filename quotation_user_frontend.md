AluMate – User Dashboard Frontend Development Plan
Intelligent Material Recommendation & Labor Cost Calculation System
Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the frontend implementation plan for the User Dashboard Product Configuration, Material Recommendation, and Quotation Estimation System.

The system is designed specifically for:

Residential aluminium fabrication customers

The goal is to provide an intelligent workflow where users can:

create custom aluminium designs
use pre-designed catalogue products
enter measurements and requirements
receive smart material recommendations
receive estimated quotations
understand material and labor calculations
1. MODULE OVERVIEW

The quotation input system contains two main sections:

1. Create Your Own Design
2. Design Catalogue

Both modules connect to the same quotation generation system.

2. OVERALL USER FLOW
Select Design
OR
Create Custom Design
        ↓
Enter Measurements
        ↓
Enter Product Requirements
        ↓
Backend Rule Engine Analyzes Inputs
        ↓
Admin-Configured Rules Applied
        ↓
System Selects Materials Automatically
        ↓
System Calculates Material & Labor Costs
        ↓
Frontend Displays Recommendations
        ↓
Submit Quotation Request
3. IMPORTANT SYSTEM PRINCIPLE

Users SHOULD NOT manually select aluminium bars or technical materials.

Instead:

System automatically recommends suitable materials

based on:

measurements
product type
design type
purpose
environment
strength requirements
4. USER DASHBOARD NAVIGATION
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
5. CREATE YOUR OWN DESIGN PAGE
Route
/dashboard/design/new
6. PAGE OBJECTIVE

Allow users to:

select product type
create custom design
configure measurements
receive material recommendations
receive estimated quotation
7. PAGE LAYOUT STRUCTURE
-------------------------------------------------

Sidebar

Top Navigation

-------------------------------------------------

Product Selection Section

-------------------------------------------------

2D / 3D Workspace

-------------------------------------------------

Configuration Panel

-------------------------------------------------

Recommended Materials Panel

-------------------------------------------------

Live Estimation Panel

-------------------------------------------------

Quotation Submission Section
8. PRODUCT TYPE SELECTION
Example Product Types
Window
Door
Pantry
Cupboard
Partition
Railing
Other
Product Card Design

Each card should contain:

image/icon
product name
short description
select button
9. DESIGN WORKSPACE
Technologies
Fabric.js → 2D Design
Three.js → 3D Preview
Workspace Layout
Toolbar

2D / 3D Toggle

Canvas Area

Properties Panel
10. CONFIGURATION PANEL
Main Purpose

Collect all required data for:

material recommendation
quotation generation
labor calculation
11. CONFIGURATION PANEL SECTIONS
Measurements
Purpose
Environment
Strength Category
Colors & Finish
Accessories
Additional Notes
12. MEASUREMENT INPUTS

Inputs should change dynamically depending on:

selected product type
Example – Pantry
Width
Height
Depth
Compartment Count
Example – Window
Width
Height
Panel Count
Sliding / Casement
Example – Door
Width
Height
Opening Direction
Lock Type
13. PURPOSE SELECTION
IMPORTANT FIELD

Purpose affects:

selected materials
profile thickness
accessories
labor cost
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
14. ENVIRONMENT SELECTION
Options
Indoor
Outdoor
Wet Area
High Sun Exposure
15. STRENGTH CATEGORY
Options
Light Duty
Medium Duty
Heavy Duty
16. COLOR & FINISH SECTION
Example Options
Black
White
Silver
Champagne Gold
Wood Finish
Custom Color
17. ACCESSORIES SECTION
Dynamic Options

Examples:

Handles
Locks
Rails
Glass Types
Hinges
18. INTELLIGENT MATERIAL RECOMMENDATION SYSTEM
IMPORTANT ARCHITECTURE

Frontend does NOT decide materials directly.

Instead:

Frontend collects user inputs
        ↓
Backend rule engine processes rules
        ↓
Admin-configured logic applied
        ↓
Backend returns recommended materials
        ↓
Frontend displays recommendations
19. ADMIN-CONTROLLED MATERIAL RULES

The system should support rules such as:

Example Rule 1
IF:
Product = Window
Type = Sliding
Width < 1500mm

THEN:
Use 70mm Sliding Profile
Example Rule 2
IF:
Product = Window
Type = Sliding
Width > 1500mm

THEN:
Use 80mm Sliding Profile
Example Rule 3
IF:
Product = Pantry
Purpose = Heavy Usage

THEN:
Use Heavy Pantry Bar
20. RECOMMENDED MATERIALS PANEL
Main Goal

Display all recommended materials selected by backend.

Example UI
-----------------------------------

Recommended Materials

Aluminium Profile:
80mm Sliding Profile

Thickness:
1.4mm Heavy Duty

Glass:
Tempered Glass

Accessories:
Premium Sliding Rail
Heavy Lock System

Strength Category:
Heavy Duty

-----------------------------------
21. MATERIAL PRICE DISPLAY

Each material recommendation should display:

profile name
thickness
estimated material quantity
price per feet
estimated material cost
22. MOCK MATERIAL PRICES (INITIAL SETUP)
Windows
41mm Casement → Rs. 950 / ft

70mm Sliding → Rs. 1200 / ft

80mm Sliding → Rs. 1600 / ft

60mm Casement → Rs. 1100 / ft
Doors
100mm Sliding Door → Rs. 2500 / ft

100mm Swing Door → Rs. 1800 / ft
Pantry
Pantry Bar → Rs. 2200 / ft
IMPORTANT NOTE

These are:

temporary mock prices

Later:

Admin can replace all prices dynamically
from admin dashboard.
23. EXPLANATION SECTION

The system should explain WHY materials were selected.

Example:

Selected because:
- Large width detected
- Outdoor exposure
- Heavy usage requirement
24. LABOR COST CALCULATION SYSTEM
IMPORTANT LOGIC

Labor cost depends on:

selected material/profile

NOT directly on product type.

25. LABOR CALCULATION FLOW
Measurements
        ↓
Area Calculation
        ↓
Backend Selects Material/Profile
        ↓
Selected Profile Contains Labor Rate
        ↓
Labor Cost Calculation
26. AREA CALCULATION
Formula
Area = Width × Height

Convert into:

square feet
27. LABOR COST FORMULA
Labor Cost =
Area (sq.ft) × Labor Rate Per Sq.ft
28. LABOR RATES
Pantry
Pantry Bar → Rs. 750 / sq.ft
Windows
41mm Casement → Rs. 250 / sq.ft

70mm Sliding → Rs. 250 / sq.ft

80mm Sliding → Rs. 350 / sq.ft

60mm Casement → Rs. 300 / sq.ft
Doors
100mm Sliding Door → Rs. 750 / sq.ft

100mm Swing Door → Rs. 450 / sq.ft
29. EXAMPLE LABOR CALCULATION
Example
Width = 6ft
Height = 4ft

Area = 24 sq.ft
Selected Material
80mm Sliding
Labor Rate
Rs. 350 / sq.ft
Final Labor Cost
24 × 350 = Rs. 8,400
30. LIVE ESTIMATION PANEL
Display
Estimated Material Cost
Estimated Labor Cost
Estimated Installation Cost
Estimated Total
IMPORTANT NOTE

Display:

Final quotation will be reviewed by admin.
31. DESIGN CATALOGUE PAGE
Route
/dashboard/design/catalogue
32. PAGE OBJECTIVE

Allow users to:

browse pre-designed products
configure measurements
receive quotations

WITHOUT editing design layout.

33. PRODUCT DETAILS PAGE
Route
/dashboard/design/catalogue/[id]
34. IMPORTANT RULE

Users CAN:

change measurements
change requirements
change colors

Users CANNOT:

edit design structure/layout
35. PRODUCT DETAILS LAYOUT
Product Preview

Measurements Panel

Requirements Panel

Recommended Materials

Live Estimation

Quotation Submission
36. RECOMMENDED COMPONENT STRUCTURE
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
RecommendedMaterialsPanel.tsx
LiveEstimatePanel.tsx
QuotationSummary.tsx
37. RESPONSIVE DESIGN REQUIREMENTS
Desktop
split layout
large canvas area
side panels
Tablet
collapsible panels
stacked sections
Mobile
step-by-step wizard layout
simplified UI
38. UI/UX REQUIREMENTS

Follow existing AluMate design system:

dark theme
neon gradients
glassmorphism cards
rounded layouts
smooth transitions
sidebar consistency
39. VALIDATION REQUIREMENTS
Required Inputs
Product Type
Measurements
Purpose
Strength Category
Optional Inputs
Accessories
Additional Notes
Custom Color
40. DEVELOPMENT PHASES
PHASE 1
Product selection UI
Static configuration forms
PHASE 2
Fabric.js integration
2D workspace
PHASE 3
Three.js integration
3D preview
PHASE 4
Material recommendation UI
PHASE 5
Labor & estimation calculations
PHASE 6
Backend API integration
Submission workflow
41. FINAL OBJECTIVE

This frontend module should behave as:

an intelligent residential aluminium product configurator

NOT:

a complex industrial CAD system
42. SUMMARY

This frontend system allows users to:

create custom aluminium designs
configure pre-designed catalogue products
receive intelligent material recommendations
understand selected materials
view material prices
understand labor calculations
generate quotation requests

while maintaining:

scalable architecture
admin-controlled business rules
realistic residential workflows
modern UI consistency
intelligent user experience