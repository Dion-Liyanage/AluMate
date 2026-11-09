/**
 * TypeScript type definitions
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: 'pending' | 'quoted' | 'confirmed' | 'in-progress' | 'fabrication_completed' | 'completed' | 'cancelled';
  quotationId?: string;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotation {
  id: string;
  customerId: string;
  orderId?: string;
  productType?: string;
  items: QuotationItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'pending' | 'pending_approval' | 'revision_requested' | 'approved' | 'declined' | 'expired';
  validUntil: Date;
  createdAt: Date;
}

export interface QuotationItem {
  description: string;
  material: string;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceRequest {
  id: string;
  _id?: string;
  customerId: string;
  customerName: string;
  serviceType: 'on-site-visit' | 'repair';
  status:
    | 'Request Sent'
    | 'Pending'
    | 'Approved'
    | 'In Progress'
    | 'Completed'
    | 'Rejected'
    | 'Cancelled by Customer';
  date: string;
  // On-site visit fields
  timeSlot?: string;
  contactNumber?: string;
  nearestTown?: string;
  location?: { lat: number; lng: number };
  manualAddress?: string;
  // Repair fields
  orderId?: string;
  issueDescription?: string;
  imageUrl?: string;
  // Admin fields
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceAvailability {
  date: string;
  slots: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'raw-material' | 'finished-product';
  quantity: number;
  unit: string;
  reorderLevel: number;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'quotation' | 'service' | 'system';
  isRead: boolean;
  createdAt: Date;
}

export interface ProjectFeedback {
  name: string;
  comment: string;
  rating: number;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  feedbacks: ProjectFeedback[];
  location?: string;
  materialUsed?: string;
  isActive: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Materials & Bill of Materials ----------

export type SystemType = 'sliding' | 'swing' | 'fixed';

export const PROFILE_SHAPES = [
  'frame', 'track', 'jamb', 'sash', 'interlock', 'mullion', 'transom', 'rail', 'bead', 'box', 'other',
] as const;
export type ProfileShape = (typeof PROFILE_SHAPES)[number];

export interface MaterialProfile {
  _id: string;
  code: string;
  name: string;
  series: string;
  shape: ProfileShape;
  thicknessMm: number;
  weightKgPerM: number;
  barLengthFt: number;
  pricePerFt: number;
  isActive: boolean;
  isSample?: boolean;
}

export interface BomLineRule {
  component: string;
  profileCode: string;
  quantityFormula: string;
  lengthFormula: string;
  cutAngle: 45 | 90;
}

export interface SizeBand {
  name: string;
  maxWidthFt?: number | null;
  maxHeightFt?: number | null;
  maxAreaSqFt?: number | null;
  maxPanelWidthFt?: number | null;
  laborRatePerSqFt: number;
  glassRatePerSqFt: number;
  hardwareCostPerPanel: number;
  lines: BomLineRule[];
}

export interface ProductTemplate {
  _id: string;
  productType: 'window' | 'door';
  systemType: SystemType;
  name: string;
  description?: string;
  minPanels: number;
  maxPanels: number;
  defaultPanels: number;
  sizeBands: SizeBand[];
  isActive: boolean;
  isSample?: boolean;
}

export type OpeningSystem = Pick<
  ProductTemplate,
  '_id' | 'productType' | 'systemType' | 'name' | 'description' | 'minPanels' | 'maxPanels' | 'defaultPanels'
>;

export interface BomInput {
  measurements: Record<string, string | number>;
  panels?: number;
  verticalBars?: number;
  horizontalBars?: number;
  color?: string;
}

export interface BomLineResult {
  component: string;
  profileCode: string;
  profileName: string;
  series: string;
  thicknessMm: number;
  cutAngle: number;
  quantity: number;
  cutLengthIn: number;
  totalLengthFt: number;
  weightKg: number;
  pricePerFt: number;
  cost: number;
}

export interface BomProfileSummary {
  profileCode: string;
  profileName: string;
  thicknessMm: number;
  barLengthFt: number;
  totalLengthFt: number;
  weightKg: number;
  cost: number;
  minimumBars: number;
  /** Bars to purchase per the cutting optimiser (missing on cut lists saved before it existed). */
  barsNeeded?: number;
  longestCutIn: number;
}

export interface BomResult {
  templateId?: string;
  productType: string;
  systemType: SystemType;
  templateName: string;
  sizeBand: string;
  inputs: {
    widthIn: number;
    heightIn: number;
    panels: number;
    verticalBars: number;
    horizontalBars: number;
    billableAreaSqFt: number;
    color?: string;
  };
  lines: BomLineResult[];
  profiles: BomProfileSummary[];
  totals: {
    totalLengthFt: number;
    aluminiumWeightKg: number;
    barsNeeded?: number;
    plannedWasteRatePct?: number;
    profileCost: number;
    glassCost: number;
    hardwareCost: number;
    laborCost: number;
    finishSurcharge: number;
    materialCost: number;
    total: number;
  };
  laborRatePerSqFt: number;
  explanation: string[];
  warnings: string[];
  generatedAt: string;
}

// ---------- Cutting plan (optimiser) ----------

export type LeftoverType = 'offcut' | 'scrap' | 'none';

export interface PlannedCut {
  component: string;
  lengthIn: number;
  isJoint?: boolean;
}

export interface PlannedBar {
  index: number;
  cuts: PlannedCut[];
  usedIn: number;
  kerfIn: number;
  leftoverIn: number;
  leftoverType: LeftoverType;
}

export interface ProfileCuttingPlan {
  profileCode: string;
  profileName: string;
  barLengthIn: number;
  bars: PlannedBar[];
  barsNeeded: number;
  pieces: number;
  purchasedKg: number;
  usedKg: number;
  reusableOffcutsKg: number;
  scrapWasteKg: number;
  purchaseCost: number;
}

export interface CuttingPlan {
  settings: { kerfIn: number; minReusableOffcutIn: number };
  profiles: ProfileCuttingPlan[];
  totals: {
    bars: number;
    pieces: number;
    purchasedKg: number;
    usedKg: number;
    reusableOffcutsKg: number;
    scrapWasteKg: number;
    purchaseCost: number;
    efficiencyPct: number;
    wasteRatePct: number;
  };
  warnings: string[];
}
