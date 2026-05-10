/**
 * Quotation configuration data — product-specific measurements,
 * purposes, accessories and estimation logic.
 */

// ---------- Product Measurement Definitions ----------

export interface MeasurementField {
  key: string;
  label: string;
  type: "number" | "select";
  unit?: string;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export const productMeasurements: Record<string, MeasurementField[]> = {
  window: [
    { key: "width", label: "Width", type: "number", unit: "mm", placeholder: "e.g. 1200", min: 300, max: 5000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 1500", min: 300, max: 4000 },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 2", min: 1, max: 8 },
    { key: "openingType", label: "Opening Type", type: "select", options: ["Sliding", "Fixed", "Casement", "Louvre"] },
  ],
  door: [
    { key: "width", label: "Width", type: "number", unit: "mm", placeholder: "e.g. 900", min: 600, max: 3000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 2100", min: 1800, max: 3500 },
    { key: "openingDirection", label: "Opening Direction", type: "select", options: ["Left", "Right", "Sliding", "Bi-fold"] },
    { key: "lockType", label: "Lock Type", type: "select", options: ["Standard", "Multi-point", "Smart Lock", "None"] },
  ],
  cupboard: [
    { key: "width", label: "Width", type: "number", unit: "mm", placeholder: "e.g. 1800", min: 300, max: 5000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 2400", min: 600, max: 3500 },
    { key: "depth", label: "Depth", type: "number", unit: "mm", placeholder: "e.g. 600", min: 200, max: 1200 },
    { key: "compartmentCount", label: "Compartment Count", type: "number", placeholder: "e.g. 4", min: 1, max: 12 },
  ],
  pantry: [
    { key: "width", label: "Width", type: "number", unit: "mm", placeholder: "e.g. 2400", min: 600, max: 6000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 2400", min: 600, max: 3500 },
    { key: "depth", label: "Depth", type: "number", unit: "mm", placeholder: "e.g. 600", min: 200, max: 1200 },
    { key: "compartmentCount", label: "Compartment Count", type: "number", placeholder: "e.g. 6", min: 1, max: 20 },
  ],
  partition: [
    { key: "width", label: "Width", type: "number", unit: "mm", placeholder: "e.g. 3000", min: 600, max: 10000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 2700", min: 1500, max: 4000 },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 3", min: 1, max: 10 },
  ],
  railing: [
    { key: "length", label: "Length", type: "number", unit: "mm", placeholder: "e.g. 5000", min: 500, max: 20000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 1000", min: 600, max: 1500 },
    { key: "postCount", label: "Post Count", type: "number", placeholder: "e.g. 6", min: 2, max: 40 },
  ],
  other: [
    { key: "width", label: "Width", type: "number", unit: "mm", placeholder: "e.g. 1000", min: 100, max: 10000 },
    { key: "height", label: "Height", type: "number", unit: "mm", placeholder: "e.g. 1000", min: 100, max: 10000 },
    { key: "depth", label: "Depth (Optional)", type: "number", unit: "mm", placeholder: "e.g. 500", min: 0, max: 5000 },
  ],
};

// ---------- Purpose Definitions ----------

export const productPurposes: Record<string, string[]> = {
  window: ["Bedroom Window", "Kitchen Window", "Large Hall Window", "Outdoor Exposure", "Bathroom Window"],
  door: ["Main Entrance", "Interior Room", "Balcony / Patio", "Kitchen Door", "Security Door"],
  cupboard: ["Wardrobe", "Kitchen Storage", "Office Storage", "Display Cabinet", "Utility Storage"],
  pantry: ["Light Home Usage", "Standard Family Usage", "Heavy Kitchen Usage", "Luxury Interior Usage"],
  partition: ["Office Partition", "Bathroom Partition", "Room Divider", "Showroom Display", "Balcony Enclosure"],
  railing: ["Balcony Railing", "Staircase Railing", "Boundary Fence", "Pool Railing", "Terrace Railing"],
  other: ["Residential", "Commercial", "Industrial", "Custom Fabrication"],
};

// ---------- Environment Options ----------

export const environmentOptions = [
  { value: "indoor", label: "Indoor", description: "Protected interior spaces" },
  { value: "outdoor", label: "Outdoor", description: "Exposed to weather elements" },
  { value: "wet-area", label: "Wet Area", description: "Bathrooms, kitchens, pools" },
  { value: "high-sun", label: "High Sun Exposure", description: "Direct sunlight for extended hours" },
];

// ---------- Strength Categories ----------

export const strengthCategories = [
  { value: "light", label: "Light Duty", description: "Standard residential use, minimal load" },
  { value: "medium", label: "Medium Duty", description: "Regular daily use, moderate load capacity" },
  { value: "heavy", label: "Heavy Duty", description: "High traffic, maximum strength and durability" },
];

// ---------- Color & Finish Options ----------

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
  isCustom?: boolean;
}

export const colorOptions: ColorOption[] = [
  { value: "black", label: "Black", hex: "#18181b" },
  { value: "white", label: "White", hex: "#fafafa" },
  { value: "silver", label: "Silver", hex: "#a1a1aa" },
  { value: "champagne-gold", label: "Champagne Gold", hex: "#c9a96e" },
  { value: "wood-finish", label: "Wood Finish", hex: "#8B6914" },
  { value: "bronze", label: "Bronze", hex: "#8B7355" },
  { value: "custom", label: "Custom Color", hex: "#6366f1", isCustom: true },
];

// ---------- Accessories by Product Type ----------

export interface AccessoryOption {
  key: string;
  label: string;
  description?: string;
}

export const productAccessories: Record<string, AccessoryOption[]> = {
  window: [
    { key: "handles", label: "Window Handles", description: "Ergonomic aluminium handles" },
    { key: "locks", label: "Window Locks", description: "Multi-point locking system" },
    { key: "glass", label: "Glass Type", description: "Clear, frosted, or tinted glass" },
    { key: "mosquitoNet", label: "Mosquito Net", description: "Retractable insect screen" },
    { key: "grill", label: "Safety Grill", description: "Decorative safety grille" },
  ],
  door: [
    { key: "handles", label: "Door Handles", description: "Premium lever or pull handles" },
    { key: "locks", label: "Door Locks", description: "Standard or multi-point locks" },
    { key: "glass", label: "Glass Panels", description: "Clear, frosted, or decorative glass" },
    { key: "hinges", label: "Heavy Duty Hinges", description: "Stainless steel ball bearing hinges" },
    { key: "closer", label: "Door Closer", description: "Hydraulic automatic closer" },
  ],
  cupboard: [
    { key: "handles", label: "Handles", description: "Modern pull handles or knobs" },
    { key: "hinges", label: "Soft-close Hinges", description: "Silent closing mechanism" },
    { key: "glass", label: "Glass Shelves/Doors", description: "Tempered glass panels" },
    { key: "rails", label: "Drawer Rails", description: "Full-extension ball bearing rails" },
    { key: "internalLight", label: "Internal Lighting", description: "LED strip lighting" },
  ],
  pantry: [
    { key: "handles", label: "Handles", description: "Ergonomic pull handles" },
    { key: "hinges", label: "Soft-close Hinges", description: "Damped closing mechanism" },
    { key: "glass", label: "Glass Doors", description: "Frosted or clear glass" },
    { key: "pullOutBaskets", label: "Pull-out Baskets", description: "Wire basket storage" },
    { key: "internalLight", label: "Internal Lighting", description: "LED strip lighting" },
  ],
  partition: [
    { key: "glass", label: "Glass Panels", description: "Clear, frosted, or tinted" },
    { key: "blinds", label: "Integrated Blinds", description: "Built-in privacy blinds" },
    { key: "doorPanel", label: "Door Panel", description: "Sliding or hinged access" },
  ],
  railing: [
    { key: "glass", label: "Glass Panels", description: "Tempered safety glass" },
    { key: "topRail", label: "Top Rail Cap", description: "Rounded top rail cover" },
    { key: "basePlate", label: "Base Plates", description: "Stainless steel anchor plates" },
  ],
  other: [
    { key: "handles", label: "Handles" },
    { key: "locks", label: "Locks" },
    { key: "glass", label: "Glass Components" },
    { key: "hinges", label: "Hinges" },
  ],
};

// ---------- Live Estimation Logic ----------

export interface EstimationResult {
  materialCategory: string;
  materialCost: number;
  laborCost: number;
  installationCost: number;
  accessoriesCost: number;
  total: number;
}

/**
 * Generate a rough estimation based on selected configuration.
 * This is an ESTIMATE only — final pricing is reviewed by admin.
 */
export function calculateEstimate(config: {
  productType: string;
  measurements: Record<string, number | string>;
  purpose: string;
  environment: string;
  strength: string;
  color: string;
  accessories: string[];
}): EstimationResult {
  const { productType, measurements, strength, accessories } = config;

  // Base per-sqft rate by product type (LKR)
  const baseRates: Record<string, number> = {
    window: 850,
    door: 1200,
    cupboard: 950,
    pantry: 1100,
    partition: 700,
    railing: 600,
    other: 800,
  };

  const baseRate = baseRates[productType] || 800;

  // Calculate area (rough m²)
  const width = Number(measurements.width || measurements.length || 1000) / 1000;
  const height = Number(measurements.height || 1000) / 1000;
  const area = width * height;

  // Strength multiplier
  const strengthMultipliers: Record<string, number> = {
    light: 1.0,
    medium: 1.25,
    heavy: 1.6,
  };
  const strengthMult = strengthMultipliers[strength] || 1.0;

  // Material cost
  const materialCost = Math.round(area * baseRate * strengthMult);

  // Labor (35% of material)
  const laborCost = Math.round(materialCost * 0.35);

  // Installation (15% of material)
  const installationCost = Math.round(materialCost * 0.15);

  // Accessories (flat rate per selected accessory)
  const accessoryCost = accessories.length * 1500;

  // Material category
  const materialCategories: Record<string, string> = {
    light: "Standard Aluminium Profile",
    medium: "Reinforced Aluminium Profile",
    heavy: "Heavy-Gauge Aluminium Profile",
  };

  return {
    materialCategory: materialCategories[strength] || "Standard Aluminium Profile",
    materialCost,
    laborCost,
    installationCost,
    accessoriesCost: accessoryCost,
    total: materialCost + laborCost + installationCost + accessoryCost,
  };
}
