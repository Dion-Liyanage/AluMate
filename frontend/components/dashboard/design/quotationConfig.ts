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
    { key: "type", label: "Window Type", type: "select", options: ["Sliding", "Casement", "Fixed"] },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 2", min: 1, max: 8 },
  ],
  door: [
    { key: "width", label: "Width", type: "dimension", min: 2, max: 10 },
    { key: "height", label: "Height", type: "dimension", min: 6, max: 12 },
    { key: "type", label: "Door Type", type: "select", options: ["Sliding Door", "Swing Door"] },
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
    { key: "glassSticker", label: "Glass Sticker", description: "Decorative or privacy glass sticker" },
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

// ---------- Material & Labor Data ----------

export interface AluminiumProfile {
  name: string;
  thickness: string;
  pricePerFt: number;
  laborRatePerSqFt: number;
  description: string;
}

export const profileDatabase: Record<string, AluminiumProfile> = {
  "casement-41": {
    name: "41mm Casement",
    thickness: "1.2mm",
    pricePerFt: 950,
    laborRatePerSqFt: 250,
    description: "Standard casement profile for residential windows."
  },
  "sliding-70": {
    name: "70mm Sliding",
    thickness: "1.2mm",
    pricePerFt: 1200,
    laborRatePerSqFt: 250,
    description: "Standard sliding profile for medium-sized windows."
  },
  "sliding-80": {
    name: "80mm Sliding",
    thickness: "1.4mm",
    pricePerFt: 1600,
    laborRatePerSqFt: 350,
    description: "Heavy-duty sliding profile for large Hall windows."
  },
  "casement-60": {
    name: "60mm Casement",
    thickness: "1.4mm",
    pricePerFt: 1100,
    laborRatePerSqFt: 300,
    description: "Premium casement profile for high-exposure areas."
  },
  "sliding-door-100": {
    name: "100mm Sliding Door",
    thickness: "1.6mm",
    pricePerFt: 2500,
    laborRatePerSqFt: 750,
    description: "Robust sliding door profile for main entrances."
  },
  "swing-door-100": {
    name: "100mm Swing Door",
    thickness: "1.4mm",
    pricePerFt: 1800,
    laborRatePerSqFt: 450,
    description: "Standard swing door profile for interior or balcony doors."
  },
  "pantry-bar": {
    name: "Pantry Bar",
    thickness: "1.2mm",
    pricePerFt: 2200,
    laborRatePerSqFt: 750,
    description: "Specialized profile for pantry and kitchen cupboard fabrication."
  },
};

// ---------- Live Estimation Logic ----------

export interface EstimationResult {
  recommendedProfile: AluminiumProfile;
  materialCost: number;
  laborCost: number;
  installationCost: number;
  accessoriesCost: number;
  total: number;
  explanation: string[];
}

/**
 * Helper to extract feet and inches from a dimension value string (e.g. "5'2\"")
 * and return the rounded up feet value for calculation.
 */
export function getRoundedFeet(value: string | number): number {
  if (!value) return 0;
  const str = String(value);
  
  const ft = parseInt(str.match(/(\d+)'/)?.[1] || "0");
  const inches = parseInt(str.match(/(\d+)"/)?.[1] || "0");
  
  // If there are any inches, round up to next foot
  return inches > 0 ? ft + 1 : ft;
}

/**
 * Mock Rule Engine for Material Recommendation
 */
export function recommendProfile(config: {
  productType: string;
  measurements: Record<string, number | string>;
  purpose: string;
  environment: string;
  strength: string;
}): { profile: AluminiumProfile; explanation: string[] } {
  const { productType, measurements, purpose, environment, strength } = config;
  const w = getRoundedFeet(measurements.width || measurements.length || 0);
  const type = String(measurements.type || "");

  let profileKey = "casement-41";
  let explanation: string[] = ["Standard residential specification."];

  if (productType === "window") {
    if (type === "Sliding") {
      if (w > 5) { // Approx 1500mm
        profileKey = "sliding-80";
        explanation = ["Large width detected (> 5ft)", "Heavy duty requirements for stability"];
      } else {
        profileKey = "sliding-70";
        explanation = ["Standard sliding configuration selected"];
      }
    } else {
      if (environment === "outdoor" || strength === "heavy") {
        profileKey = "casement-60";
        explanation = ["Outdoor/Heavy duty requirement detected", "Enhanced weather resistance"];
      } else {
        profileKey = "casement-41";
        explanation = ["Standard casement selected for indoor/light usage"];
      }
    }
  } else if (productType === "door") {
    if (type === "Sliding Door") {
      profileKey = "sliding-door-100";
      explanation = ["Sliding door profile selected for smooth operation"];
    } else {
      profileKey = "swing-door-100";
      explanation = ["Standard swing door specification"];
    }
  } else if (productType === "pantry" || productType === "cupboard") {
    profileKey = "pantry-bar";
    explanation = ["Specialized kitchen/pantry bar selected for longevity"];
    if (purpose.includes("Heavy")) {
      explanation.push("Heavy usage requirement detected");
    }
  } else {
    // Default fallback
    profileKey = "casement-41";
    explanation = ["General purpose profile assigned"];
  }

  return {
    profile: profileDatabase[profileKey] || profileDatabase["casement-41"],
    explanation
  };
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
  const { productType, measurements, accessories } = config;

  // 1. Get recommendation
  const { profile, explanation } = recommendProfile(config);

  // 2. Calculate dimensions
  const w = getRoundedFeet(measurements.width || measurements.length || 0);
  const h = getRoundedFeet(measurements.height || 0);
  const area = (w || 1) * (h || 1);
  const perimeter = (w + h) * 2; // Estimated linear feet for material cost

  // 3. Calculate costs
  // Material: perimeter (linear ft) * price/ft
  const materialCost = Math.round(perimeter * profile.pricePerFt);

  // Labor: Area (sq.ft) * Labor Rate
  const laborCost = Math.round(area * profile.laborRatePerSqFt);

  // Installation (15% of material - keeping this as a general rule)
  const installationCost = Math.round(materialCost * 0.15);

  // Accessories (flat rate 1500 LKR per accessory)
  const accessoryCost = accessories.length * 1500;

  return {
    recommendedProfile: profile,
    materialCost,
    laborCost,
    installationCost,
    accessoriesCost: accessoryCost,
    total: materialCost + laborCost + installationCost + accessoryCost,
    explanation
  };
}
