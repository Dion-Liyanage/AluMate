AluMate Design Studio (Hardcoded 3D) – Implementation Plan
Project

AluMate – Aluminium Fabrication Design System

This document describes the implementation of the custom design tool using Fabric.js (2D) and Three.js (3D) with hardcoded geometries.

This is the Phase 1 implementation, which will later be upgraded to Blender GLB models.

1. Objective

Build an interactive design system where users can:

select product type (window, door, cupboard, etc.)

load aluminium components

design using a 2D canvas (Fabric.js)

preview design in 3D (Three.js)

toggle between 2D and 3D views

save design and continue to order

2. System Flow
Dashboard
   ↓
Create New Design
   ↓
Select Product Type
   ↓
Open Design Studio
   ↓
Load Component Library
   ↓
Design in 2D (Fabric.js)
   ↓
Switch to 3D Preview (Three.js)
   ↓
Save / Continue to Order
3. Page Structure
Routes
/dashboard/design/new
/dashboard/design/studio
4. Design Studio Layout
--------------------------------------------------------
Header (Product Type + Toggle)

[ 2D View ] [ 3D View ]

--------------------------------------------------------

| Components Panel | Canvas / Preview Area             |
|------------------|----------------------------------|
| Frame            |                                  |
| Shelf            |                                  |
| Divider          |      (Fabric or Three Canvas)    |
| Glass Panel      |                                  |
| Handle           |                                  |
--------------------------------------------------------
5. Folder Structure
components/design-studio/

DesignStudio.tsx
ViewToggle.tsx
ComponentLibrary.tsx
FabricCanvas.tsx
ThreePreview.tsx
DesignToolbar.tsx

lib/

fabric/
   fabricSetup.ts
   snapping.ts
   zoomPan.ts

three/
   threeSetup.ts
   meshFactory.ts
   sync.ts
6. Product-Based Component System

Create config file:

config/aluminiumComponents.ts
Example
export const components = {
  cupboard: [
    { id: "frame", label: "Frame" },
    { id: "shelf", label: "Shelf" },
    { id: "divider", label: "Divider" },
    { id: "glass", label: "Glass Panel" },
    { id: "handle", label: "Handle" }
  ],
  window: [
    { id: "frame", label: "Frame" },
    { id: "glass", label: "Glass Panel" }
  ]
}
7. Component Library UI

Each item:

+-------------------+
| Frame             |
| placeholder icon  |
| Add to canvas     |
+-------------------+

Click → adds object to Fabric canvas.

8. Fabric.js Implementation (2D)
Initialize Canvas
const canvas = new fabric.Canvas('canvas', {
  width: 800,
  height: 600,
});
Add Component Function
function addComponent(type) {
  let obj;

  switch (type) {
    case "frame":
      obj = new fabric.Rect({
        width: 200,
        height: 120,
        stroke: "#aaa",
        fill: "transparent",
        strokeWidth: 4
      });
      break;

    case "shelf":
      obj = new fabric.Rect({
        width: 180,
        height: 20,
        fill: "#ccc"
      });
      break;

    case "glass":
      obj = new fabric.Rect({
        width: 180,
        height: 100,
        fill: "rgba(135,206,235,0.4)"
      });
      break;
  }

  obj.customId = generateId();
  obj.componentType = type;

  canvas.add(obj);
}
Enable Features
Snap Alignment

Reuse:

movingHandler()
Zoom
canvas.on('mouse:wheel', wheelHandler);
Pan
mouseDownPan()
mouseMovePan()
9. Three.js Implementation (3D)
Setup Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(...);
const renderer = new THREE.WebGLRenderer(...);

Add:

lights
OrbitControls
10. Mesh Factory (Hardcoded)

Create:

lib/three/meshFactory.ts
Example
export function createMesh(type) {
  let geometry;

  switch (type) {
    case "frame":
      geometry = new THREE.BoxGeometry(2, 1, 0.1);
      break;

    case "shelf":
      geometry = new THREE.BoxGeometry(2, 0.1, 0.5);
      break;

    case "glass":
      geometry = new THREE.PlaneGeometry(2, 1);
      break;

    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.7,
    roughness: 0.3,
  });

  return new THREE.Mesh(geometry, material);
}
11. Fabric → Three Sync
Mapping Formula
const scale = 0.01;

const x = (obj.left - canvasWidth / 2) * scale;
const y = (canvasHeight / 2 - obj.top) * scale;
Sync Function
function syncObject(obj) {
  let mesh = meshMap[obj.customId];

  if (!mesh) {
    mesh = createMesh(obj.componentType);
    meshMap[obj.customId] = mesh;
    scene.add(mesh);
  }

  mesh.position.set(x, y, 0);
}
Events
canvas.on('object:added', syncObject);
canvas.on('object:modified', syncObject);
canvas.on('object:moving', syncObject);
12. 2D / 3D Toggle
UI
[ 2D View ] [ 3D View ]
State
const [viewMode, setViewMode] = useState("2D");
Render
{viewMode === "2D" ? <FabricCanvas /> : <ThreePreview />}
13. Toolbar
Delete
Duplicate
Undo
Redo
Clear Canvas
14. Save Design
Save JSON
const json = canvas.toJSON();
Save Preview
const image = canvas.toDataURL();
Store
{
  "userId": "...",
  "productType": "cupboard",
  "designJson": {},
  "previewImage": "...",
  "createdAt": "..."
}
15. Continue to Order

Pass:

designJson
previewImage
productType

To:

/dashboard/orders/new
16. Performance Optimization
Use Debounce
debounce(syncObject, 100)
Avoid Full Re-render

Only update modified objects.

17. Future Upgrade (Blender)

Replace:

createMesh(type)

With:

loadGLBModel(type)

No change needed in:

Fabric logic
UI
Database
18. Development Phases
Phase 1

Fabric canvas

Add components

Basic UI

Phase 2

Snap alignment

Zoom / pan

Phase 3

Three.js setup

Sync system

Phase 4

Toggle view

Toolbar

Phase 5

Save design

Order integration

19. Final Outcome

User can:

Select Product
   ↓
Load Aluminium Components
   ↓
Design in 2D
   ↓
Switch to 3D
   ↓
Save / Order
20. Key Advantage

This approach allows:

fast development

stable system

easy upgrade to Blender

strong final demo