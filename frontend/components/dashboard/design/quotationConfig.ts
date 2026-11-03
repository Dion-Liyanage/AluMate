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
    { key: "width", label: "Total Width", type: "dimension", min: 1, max: 20 },
    { key: "height", label: "Total Height", type: "dimension", min: 1, max: 15 },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 2", min: 1, max: 8 },
  ],
  door: [
    { key: "width", label: "Total Width", type: "dimension", min: 2, max: 10 },
    { key: "height", label: "Total Height", type: "dimension", min: 6, max: 12 },
    { key: "panelCount", label: "Panel Count", type: "number", placeholder: "e.g. 1", min: 1, max: 4 },
  ],
  cupboard: [
    { key: "width", label: "Total Width", type: "dimension", min: 1, max: 20 },
    { key: "height", label: "Total Height", type: "dimension", min: 2, max: 15 },
    { key: "depth", label: "Total Depth", type: "dimension", min: 1, max: 5 },
  ],
  pantry: [
    { key: "width", label: "Total Width", type: "dimension", min: 2, max: 30 },
    { key: "height", label: "Total Height", type: "dimension", min: 2, max: 15 },
    { key: "depth", label: "Total Depth", type: "dimension", min: 1, max: 5 },
  ],
  ceiling: [
    { key: "width", label: "Total Width", type: "dimension", min: 5, max: 100 },
    { key: "length", label: "Total Length", type: "dimension", min: 5, max: 100 },
  ],
};

// ---------- Purpose Definitions ----------

export const productPurposes: Record<string, string[]> = {
  window: ["Bedroom Window", "Kitchen Window", "Large Hall Window", "Outdoor Exposure", "Bathroom Window"],
  door: ["Main Entrance", "Interior Room", "Balcony / Patio", "Kitchen Door", "Security Door"],
  cupboard: ["Wardrobe", "Kitchen Storage", "Office Storage", "Display Cabinet", "Utility Storage"],
  pantry: ["Light Home Usage", "Standard Family Usage", "Heavy Kitchen Usage", "Luxury Interior Usage"],
  ceiling: ["Living Room Ceiling", "Office Ceiling", "Kitchen Ceiling", "Decorative Feature", "Commercial Ceiling"],
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
  { value: "wood-finish", label: "Wood Finish", hex: "#5C3A21" },
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
  ceiling: [
    { key: "ledStrip", label: "LED Strip Lighting", description: "Perimeter lighting effect" },
    { key: "cornice", label: "Decorative Cornice", description: "Premium edge finishing" },
    { key: "paneling", label: "Accent Paneling", description: "High-contrast material panels" },
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
  materialCost: number;
  laborCost: number;
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

export function recommendProfile(config: {
  productType: string;
  measurements: Record<string, number | string>;
  purpose: string;
  environment: string;
  strength: string;
}): { profile: AluminiumProfile; explanation: string[] } {
  const { productType, measurements, purpose, environment, strength } = config;
  const w = getRoundedFeet(measurements.width || measurements.length || 0);

  let profileKey = "casement-41";
  let explanation: string[] = ["Standard residential specification."];

  if (productType === "window") {
    if (w > 5) {
      profileKey = "sliding-80";
      explanation = ["Large width detected (> 5ft)", "Heavy duty sliding profile recommended for stability"];
    } else if (environment === "outdoor" || strength === "heavy") {
      profileKey = "casement-60";
      explanation = ["Outdoor/Heavy duty requirement detected", "Enhanced weather resistance recommended"];
    } else {
      profileKey = "sliding-70";
      explanation = ["Standard profile suggested for indoor/light usage"];
    }
  } else if (productType === "door") {
    if (w > 4) {
      profileKey = "sliding-door-100";
      explanation = ["Large width detected", "Sliding door profile recommended for wide entrances"];
    } else {
      profileKey = "swing-door-100";
      explanation = ["Standard swing door specification recommended"];
    }
  } else if (productType === "pantry" || productType === "cupboard") {
    profileKey = "pantry-bar";
    explanation = ["Specialized kitchen/pantry bar selected for longevity"];
    if (purpose.includes("Heavy") || strength === "heavy") {
      explanation.push("Heavy usage requirement detected");
    }
  } else if (productType === "ceiling") {
    profileKey = "casement-60"; // Using casement-60 as a base for ceiling frames
    explanation = ["Ceiling grid framework selected", "Lightweight but rigid profile for overhead safety"];
  } else {
    // Default fallback
    profileKey = "casement-41";
    explanation = ["General purpose profile assigned based on dimensions"];
  }

  return {
    profile: profileDatabase[profileKey] || profileDatabase["casement-41"],
    explanation
  };
}

/**
 * Generate a rough estimation based on selected configuration.
 *
 * Pricing tiers:
 *   Window (per sq.ft based on area):
 *     - Area ≤ 28 sq.ft (4×7):  Material 2,750 | Labor 250
 *     - Area ≤ 63 sq.ft (7×9):  Material 4,500 | Labor 300
 *     - Area > 63 sq.ft:        Material 7,500 | Labor 750
 *   Door (flat rate, all sizes):
 *     - Material 25,000 | Labor 3,000
 *   Pantry / Cupboard (per cubic foot, all-inclusive):
 *     - 14,000 per cu.ft
 *   Color surcharge:
 *     - Black / White / Silver: no surcharge
 *     - Wood Finish: +30% on total
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
  const { productType, measurements, color } = config;

  const w = getRoundedFeet(measurements.width || measurements.length || 0);
  const h = getRoundedFeet(measurements.height || 0);
  const d = getRoundedFeet(measurements.depth || 0);

  let materialCost = 0;
  let laborCost = 0;
  let explanation: string[] = [];

  if (productType === "window") {
    const area = (w || 1) * (h || 1);

    if (area <= 28) {
      // Tier 1: up to 4×7 (28 sq.ft)
      materialCost = area * 2750;
      laborCost = area * 250;
      explanation = [
        `Window area: ${area} sq.ft (${w}' × ${h}')`,
        "Standard tier pricing (up to 4×7)",
        "Material: LKR 2,750/sq.ft — Labor: LKR 250/sq.ft",
      ];
    } else if (area <= 63) {
      // Tier 2: above 4×7 up to 7×9 (63 sq.ft)
      materialCost = area * 4500;
      laborCost = area * 300;
      explanation = [
        `Window area: ${area} sq.ft (${w}' × ${h}')`,
        "Medium tier pricing (up to 7×9)",
        "Material: LKR 4,500/sq.ft — Labor: LKR 300/sq.ft",
      ];
    } else {
      // Tier 3: above 7×9
      materialCost = area * 7500;
      laborCost = area * 750;
      explanation = [
        `Window area: ${area} sq.ft (${w}' × ${h}')`,
        "Large tier pricing (above 7×9)",
        "Material: LKR 7,500/sq.ft — Labor: LKR 750/sq.ft",
      ];
    }
  } else if (productType === "door") {
    materialCost = 25000;
    laborCost = 3000;
    explanation = [
      "Flat rate pricing for all door sizes",
      "Material: LKR 25,000 — Labor: LKR 3,000",
    ];
  } else if (productType === "pantry" || productType === "cupboard") {
    const volume = (w || 1) * (h || 1) * (d || 1);
    materialCost = volume * 14000;
    laborCost = 0;
    explanation = [
      `${productType === "pantry" ? "Pantry" : "Cupboard"} volume: ${volume} cu.ft (${w}' × ${h}' × ${d}')`,
      "Rate: LKR 14,000 per cubic foot (all-inclusive)",
    ];
  } else if (productType === "ceiling") {
    const area = (w || 1) * (h || 1);
    materialCost = area * 2750;
    laborCost = area * 250;
    explanation = [
      `Ceiling area: ${area} sq.ft (${w}' × ${h}')`,
      "Standard ceiling rate applied",
    ];
  }

  // Color surcharge: wood finish adds 30% to total
  if (color === "wood-finish") {
    materialCost = Math.round(materialCost * 1.3);
    laborCost = Math.round(laborCost * 1.3);
    explanation.push("Wood finish selected — 30% surcharge applied");
  }

  return {
    materialCost,
    laborCost,
    total: materialCost + laborCost,
    explanation,
  };
}
