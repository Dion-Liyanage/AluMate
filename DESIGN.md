1. Updated Workflow (Full Design Flow)

Your design workflow should now look like this:

User Dashboard
     ↓
Create Your Own Design
     ↓
Select Product Type
     ↓
Load Aluminium Components
     ↓
Open Design Studio
     ↓
Design Product (Fabric.js 2D)
     ↓
Toggle 3D Preview (Three.js)
     ↓
Save Design / Continue Order
2. Page Flow
Step 1 — Select Product Type (Already Built)

Your screenshot already implements this.

Example options:

Window
Door
Cupboard
Partition
Railing
Other

Example route:

/dashboard/design/new

When user clicks Cupboard:

navigate to

/dashboard/design/studio?type=cupboard
3. Load Aluminium Components Based on Product

When the studio loads, it should check the product type.

Example:

productType = "cupboard"

Then load the related aluminium components.

Example:

Cupboard Components
---------------------
Frame
Sliding Door Panel
Shelf
Handle
Divider
Glass Panel

For now:

⚠ Only show placeholders (cards or icons).

Later you will load real aluminium models.

4. Final Design Studio Layout

We will optimize the workspace for design.

---------------------------------------------------------
Sidebar |  Design Studio Header
        |
        |-----------------------------------------------
        | Component Library      |  Design Canvas
        |                         |
        | Frame                   |
        | Shelf                   |
        | Handle                  |
        | Glass Panel             |
        | Divider                 |
        |                         |
        |-------------------------|
        |
        |           Fabric.js Canvas
        |
        |
---------------------------------------------------------

But we will add the 2D / 3D toggle to maximize workspace.

5. Updated Design Studio Layout
------------------------------------------------------------
Header
Product: Cupboard

[ 2D Design ]   [ 3D Preview ]

------------------------------------------------------------

| Components Panel |      Design Canvas (Large Area)      |
|------------------|--------------------------------------|
| Frame            |                                      |
| Shelf            |                                      |
| Handle           |                                      |
| Divider          |                                      |
| Glass Panel      |                                      |
|                  |                                      |
|                  |                                      |
------------------------------------------------------------
6. 2D / 3D Toggle (Very Important)

Instead of showing both simultaneously, allow switching.

Toggle Button
[ 2D View ]   [ 3D View ]

Benefits:

much larger workspace

better user experience

simpler rendering

2D Mode
------------------------------------------------
Toolbar

| Components |     Fabric.js Canvas           |
| Panel      |                                |
|            |                                |
|            |                                |
------------------------------------------------
3D Mode
------------------------------------------------
Toolbar

| Three.js Preview (Full width)               |
|                                             |
|                                             |
|                                             |
------------------------------------------------

This makes the preview much better.

7. Component Library Panel

This panel changes based on product type.

Example when Cupboard selected:

Aluminium Pantry Components

[ Frame ]
[ Shelf ]
[ Divider ]
[ Sliding Door ]
[ Glass Panel ]
[ Handle ]

For now:

Use cards or icons.

Example card:

+-------------------+
| Frame             |
| placeholder icon  |
| Add to canvas     |
+-------------------+
8. Canvas Behavior

Canvas uses Fabric.js.

Features:

drag objects
resize objects
rotate
snap alignment
grid
zoom
pan

You already implemented:

movingHandler()
wheelHandler()
mouseDownPan()
mouseMovePan()

from your test project.

So we reuse those functions.

9. Aluminium Shape Placeholder System

Instead of shapes:

rectangle
circle
square

Create component templates.

Example:

addComponent("shelf")

Fabric object:

new fabric.Rect({
 width: 200,
 height: 20,
 fill: "#aaa",
 stroke: "#555"
})

Later replace with real aluminium profiles.

10. Component Data Structure

Create configuration file.

components/config/aluminiumComponents.ts

Example:

export const components = {
 cupboard: [
   { id: "frame", name: "Frame" },
   { id: "shelf", name: "Shelf" },
   { id: "divider", name: "Divider" },
   { id: "glass", name: "Glass Panel" },
   { id: "handle", name: "Handle" }
 ]
}
11. Fabric → Three Synchronization

Your existing function:

addOrUpdateThreeFromFabric()

Workflow:

fabric object added
       ↓
create Three mesh
       ↓
sync position

Your coordinate mapping remains:

ThreeX = (FabricX - CanvasWidth/2) * scale
ThreeY = (CanvasHeight/2 - FabricY) * scale

Already implemented in your prototype.

12. Design Toolbar

Top toolbar:

[Delete]
[Duplicate]
[Undo]
[Redo]
[Clear Canvas]
[Toggle Grid]
13. Properties Panel (Optional Future Feature)

When selecting an object:

Width
Height
Color
Material
Glass Type
14. Saving Designs

When user clicks:

Save Design

Save:

canvas.toJSON()

Store:

designJson
previewImage
productType
userId
15. Continue to Order

Button:

Continue to Order

Send:

designJson
previewImage
productType
dimensions

to:

/dashboard/orders/new
16. Folder Structure for Implementation

Add new folder.

components/design-studio/

DesignStudio.tsx
ProductComponentLibrary.tsx
FabricCanvas.tsx
ThreePreview.tsx
ViewToggle.tsx
DesignToolbar.tsx
17. New Page Structure
app/dashboard/design/

new/page.tsx
studio/page.tsx
18. Performance Recommendation

Only update 3D when object changes.

Use:

object:modified
object:moving
object:scaling

events.

Avoid syncing every frame.

19. Final Result

User experience becomes:

Select Product
      ↓
Load Aluminium Components
      ↓
Design in 2D Canvas
      ↓
Switch to 3D Preview
      ↓
Save Design
      ↓
Order Fabrication

This makes your project look like a professional configurator platform similar to:

IKEA kitchen planner

Tesla configurator

room design tools