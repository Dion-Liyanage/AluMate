/**
 * Quotation configuration data — product-specific measurements,
 * purposes, accessories and estimation logic.
 */

// ---------- Product Measurement Definitions ----------

export interface MeasurementField {
  key: string;
  label: string;
  type: "number" | "dimension" | "select";
  unit?: string;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export const productMeasurements: Record<string, MeasurementField[]> = {
  window: [
    { key: "width", label: "Width", type: "dimension", min: 1, max: 20 },
    { key: "height", label: "Height", type: "dimension", min: 1, max: 15 },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 2", min: 1, max: 8 },
  ],
  door: [
    { key: "width", label: "Width", type: "dimension", min: 2, max: 10 },
    { key: "height", label: "Height", type: "dimension", min: 6, max: 12 },
  ],
  cupboard: [
    { key: "width", label: "Width", type: "dimension", min: 1, max: 20 },
    { key: "height", label: "Height", type: "dimension", min: 2, max: 15 },
    { key: "depth", label: "Depth", type: "dimension", min: 1, max: 5 },
    { key: "compartmentCount", label: "Compartment Count", type: "number", placeholder: "e.g. 4", min: 1, max: 12 },
  ],
  pantry: [
    { key: "width", label: "Width", type: "dimension", min: 2, max: 30 },
    { key: "height", label: "Height", type: "dimension", min: 2, max: 15 },
    { key: "depth", label: "Depth", type: "dimension", min: 1, max: 5 },
    { key: "compartmentCount", label: "Compartment Count", type: "number", placeholder: "e.g. 6", min: 1, max: 20 },
  ],
  partition: [
    { key: "width", label: "Width", type: "dimension", min: 2, max: 50 },
    { key: "height", label: "Height", type: "dimension", min: 5, max: 15 },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 3", min: 1, max: 10 },
  ],
  railing: [
    { key: "length", label: "Length", type: "dimension", min: 2, max: 100 },
    { key: "height", label: "Height", type: "dimension", min: 2, max: 5 },
    { key: "postCount", label: "Post Count", type: "number", placeholder: "e.g. 6", min: 2, max: 40 },
  ],
  other: [
    { key: "width", label: "Width", type: "dimension", min: 1, max: 50 },
    { key: "height", label: "Height", type: "dimension", min: 1, max: 50 },
    { key: "depth", label: "Depth (Optional)", type: "dimension", min: 0, max: 20 },
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
 * Helper to extract feet and inches from a dimension value string (e.g. "5'2\"")
 * and return the rounded up feet value for calculation.
 */
export function getRoundedFeet(value: string | number): number {
  if (!value) return 0;
  const str = String(value);
  
  // Pattern to match "5'2\"" or just "5'"
  const match = str.match(/(\d+)'(?:(\d+)")?/);
  if (match) {
    const feet = parseInt(match[1]);
    const inches = match[2] ? parseInt(match[2]) : 0;
    
    // If there are any inches, round up to next foot
    return inches > 0 ? feet + 1 : feet;
  }
  
  // If it's just a number, assume it's already feet and return as is
  return Math.ceil(Number(value) || 0);
}

/**
 * Generate a rough estimation based on selected configuration.
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
    window: 80,
    door: 110,
    cupboard: 90,
    pantry: 100,
    partition: 65,
    railing: 55,
    other: 75,
  };

  const baseRate = baseRates[productType] || 75;

  // Calculate area (sqft) using rounded feet
  // e.g. Width 3'2" -> 4ft, Height 5'1" -> 6ft. Area = 4 * 6 = 24 sqft.
  const w = getRoundedFeet(measurements.width || measurements.length || 0);
  const h = getRoundedFeet(measurements.height || 0);
  
  // Fallback for linear products like Railing if height is not relevant (though usually it is)
  const area = (w || 1) * (h || 1);

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
