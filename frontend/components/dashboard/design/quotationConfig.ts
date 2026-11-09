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

// ---------- Material-based (BOM) products ----------

/**
 * Windows and doors are priced from an exact bill of materials generated by
 * the backend (admin-managed aluminium profiles and product templates).
 * Other products still use the simple rate-based estimate below.
 */
export const BOM_PRODUCT_TYPES = ["window", "door"] as const;

export const isBomProduct = (productType: string) =>
  (BOM_PRODUCT_TYPES as readonly string[]).includes(productType);

export const systemTypeLabels: Record<string, string> = {
  sliding: "Sliding",
  swing: "Swing / Casement",
  fixed: "Fixed",
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

/**
 * Generate a rough estimation based on selected configuration.
 *
 * Windows and doors are NOT priced here — see isBomProduct().
 *
 * Pricing tiers:
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

  if (productType === "pantry" || productType === "cupboard") {
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
