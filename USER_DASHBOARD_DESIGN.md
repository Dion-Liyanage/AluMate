AluMate User Dashboard UI Design Plan
Project

AluMate – Web-based Aluminium Fabrication and Service Management System

This document defines the User Dashboard UI architecture and page structure after authentication.

The goal of the dashboard is to guide users through the main workflow of the platform, which is designing and ordering custom aluminium products.

1. Main Dashboard Philosophy

Unlike a typical SaaS dashboard, AluMate must prioritize product design and customization.

The dashboard should guide users through the following workflow:

Explore Designs
        ↓
Choose Product Type
        ↓
Customize Product OR Select Existing Design
        ↓
Enter Dimensions and Materials
        ↓
Request Quotation / Place Order

Therefore the dashboard UI should emphasize:

Design Studio

Design Catalogue

Past Projects

Orders & Quotations

2. Dashboard Layout Structure
---------------------------------------------------------
Sidebar        | Topbar (notifications | profile)
               |
               |  Welcome Section
               |
               |  Design Entry Section ⭐
               |
               |  Statistics Cards
               |
               |  Quick Actions
               |
               |  Recent Orders
---------------------------------------------------------
3. Sidebar Navigation Structure

The sidebar must clearly expose all system features.

Dashboard

Design Studio
    Customize Product
    Saved Designs

Design Catalogue

Orders
    My Orders
    Quotations

Services
    Measurement Requests
    Maintenance / Repairs

Projects
    Past Projects Gallery

Messages

Profile
4. Dashboard Home Page

Route:

/dashboard

Purpose:
Provide a quick overview and entry point to core features.

4.1 Welcome Section
Welcome back, {User Name} 👋

Start designing your aluminium product or manage your fabrication orders.
4.2 Design Entry Section ⭐

This is the most important section of the dashboard.

[ Customize Your Product ]
Create a completely new aluminium design

[ Browse Design Catalogue ]
Choose from available designs

[ View Past Projects ]
Explore completed fabrication work

Each option should be a card component.

4.3 Statistics Section

Display user statistics.

[ Total Orders ]
[ Pending Orders ]
[ Active Quotations ]
[ Service Requests ]

Optional additional card:

Saved Designs
4.4 Quick Actions Section
+ New Order
Request Quotation
Request Measurement
4.5 Recent Orders Section

Displays the latest orders placed by the user.

Order card example:

Order ID
Product Type
Order Status
Quotation Status
Created Date
5. Customize Product Entry Page

Route:

/dashboard/design

Purpose:
Allow users to start creating a new aluminium product order.

Step 1 — Select Product Type

Display product types as selectable cards.

[ Window ]
[ Door ]
[ Cupboard ]
[ Partition ]
[ Railing ]
[ Other ]

Component:

ProductTypeSelector
Step 2 — Choose Design Method

User chooses between two design approaches.

[ Create Custom Design ]
Design your own using the design studio

[ Use Existing Design ]
Choose from available designs

Component:

DesignMethodSelector
6. Design Catalogue Page

Route:

/dashboard/catalogue

Purpose:
Display pre-designed aluminium products.

Important rule:

Pre-designed designs cannot be customized.

Layout
Search Bar

Filters
Category
Color
Style
Material
Design Grid
[ Design Card ]  [ Design Card ]  [ Design Card ]
Design Card Layout
+---------------------------+
| Design Image              |
|                           |
| Modern Sliding Window     |
| Aluminium + Glass         |
|                           |
| [Use This Design]         |
+---------------------------+

Clicking Use This Design navigates to:

/dashboard/orders/new
7. Past Projects Gallery

Route:

/dashboard/projects

Purpose:

Provide inspiration

Show real fabrication work

Increase user trust

Gallery Layout
[ Project Card ]  [ Project Card ]  [ Project Card ]
Project Card
+-----------------------------+
| Real Project Image          |
|                             |
| Kitchen Cupboard Set        |
| Location: Colombo           |
| Material: Aluminium         |
| Color: Black                |
|                             |
| View Details                |
+-----------------------------+
Project Details Page

Includes:

project images

materials used

design description

estimated cost

customer feedback

8. Custom Design Studio Page

Route:

/dashboard/design/studio

Purpose:
Allow users to design aluminium products using Fabric.js and Three.js.

For now, only UI placeholders will be implemented.

Layout
Design Studio

Product Type: Window

----------------------------------------

| Design Canvas Placeholder           |
|                                     |
| Fabric.js / Three.js will render    |
| design editor here                  |
|                                     |

----------------------------------------

Tools Panel

Width
Height
Material
Color
Glass Type

----------------------------------------

[ Save Design ]
[ Continue to Order ]
9. New Order Page

Route:

/dashboard/orders/new

Purpose:
Collect order details.

Layout
New Order

Selected Product
Design Preview

--------------------------------

Dimensions

Width
Height

--------------------------------

Materials

Frame Material
Glass Type
Color
Accessories

--------------------------------

Upload Space Image

--------------------------------

Additional Notes

--------------------------------

[ Continue to Review ]
10. Order Review Page

Route:

/dashboard/orders/review

Purpose:
Display final order summary before submission.

Layout
Order Review

Design Preview

Product Type
Design Name

Dimensions

Materials

--------------------------------

Estimated Cost

--------------------------------

[ Request Quotation ]
[ Place Order ]
[ Save Draft ]
11. Suggested Advanced Features

To improve the project quality:

Save Draft Designs

Users should be able to save designs.

Save Design Draft
Continue Later
Estimated Cost Preview

When dimensions are entered:

Estimated Cost Range
AI Design Suggestions

Future enhancement:

Recommended Colors
Suggested Frame Type
Compatible Patterns
On-Site Measurement Request

Users can request measurements during ordering.

Request On-Site Measurement
Notifications System

Examples:

Quotation Ready
Admin Message
Measurement Scheduled
12. UI Component Architecture

Suggested React component structure.

components/

dashboard/
    DashboardStats.tsx
    QuickActions.tsx
    RecentOrders.tsx
    DesignEntryCards.tsx

design/
    ProductTypeSelector.tsx
    DesignMethodSelector.tsx
    DesignCard.tsx
    CatalogueGrid.tsx

orders/
    OrderForm.tsx
    OrderReview.tsx

projects/
    ProjectCard.tsx
    ProjectGallery.tsx
13. Recommended Development Order

Implement UI in this order:

Phase 1

Design Entry Cards

Product Type Selector

Design Method Selector

Phase 2

Design Catalogue Page

Past Projects Gallery

Phase 3

Order Form

Order Review Page

Phase 4

Design Studio Placeholder

Then integrate:

Fabric.js
Three.js
14. UX Priority

The most important action button must be:

🔥 Customize Your Product

This represents the core value of AluMate.

15. Final Goal

The dashboard should function like a product configurator platform, similar to:

IKEA Planner

Tesla Configurator

Interior design platforms

This approach highlights the innovation of the AluMate system and improves the overall user experience.