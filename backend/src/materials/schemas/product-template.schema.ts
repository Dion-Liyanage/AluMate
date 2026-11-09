import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductTemplateDocument = HydratedDocument<ProductTemplate>;

export const TEMPLATE_PRODUCT_TYPES = ['window', 'door'] as const;
export const SYSTEM_TYPES = ['sliding', 'swing', 'fixed'] as const;
export const CUT_ANGLES = [45, 90] as const;

/** One component in the cut list, e.g. "Outer frame – top & bottom". */
@Schema({ _id: false })
export class BomLine {
  @Prop({ required: true, trim: true })
  component: string;

  @Prop({ required: true, uppercase: true, trim: true })
  profileCode: string;

  /** Formula for number of pieces, e.g. "2 * P" */
  @Prop({ required: true })
  quantityFormula: string;

  /** Formula for cut length in inches, e.g. "H - 2.5" */
  @Prop({ required: true })
  lengthFormula: string;

  @Prop({ required: true, enum: CUT_ANGLES, default: 90 })
  cutAngle: number;
}
export const BomLineSchema = SchemaFactory.createForClass(BomLine);

/**
 * A size band. Bands are checked in order and the first one whose limits
 * fit the requested size is used — larger bands use stronger profiles.
 * An empty limit means "no limit".
 */
@Schema({ _id: false })
export class SizeBand {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ min: 0 })
  maxWidthFt?: number;

  @Prop({ min: 0 })
  maxHeightFt?: number;

  @Prop({ min: 0 })
  maxAreaSqFt?: number;

  /** Width of each panel / leaf (W ÷ panels) — the main strength driver for doors. */
  @Prop({ min: 0 })
  maxPanelWidthFt?: number;

  @Prop({ required: true, min: 0 })
  laborRatePerSqFt: number;

  @Prop({ required: true, min: 0, default: 0 })
  glassRatePerSqFt: number;

  @Prop({ required: true, min: 0, default: 0 })
  hardwareCostPerPanel: number;

  @Prop({ type: [BomLineSchema], default: [] })
  lines: BomLine[];
}
export const SizeBandSchema = SchemaFactory.createForClass(SizeBand);

/** A product + opening system, e.g. "Sliding Window". */
@Schema({ timestamps: true })
export class ProductTemplate {
  @Prop({ required: true, enum: TEMPLATE_PRODUCT_TYPES })
  productType: string;

  @Prop({ required: true, enum: SYSTEM_TYPES })
  systemType: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, min: 1, default: 1 })
  minPanels: number;

  @Prop({ required: true, min: 1, default: 1 })
  maxPanels: number;

  @Prop({ required: true, min: 1, default: 1 })
  defaultPanels: number;

  @Prop({ type: [SizeBandSchema], default: [] })
  sizeBands: SizeBand[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSample: boolean;
}

export const ProductTemplateSchema = SchemaFactory.createForClass(ProductTemplate);

ProductTemplateSchema.index({ productType: 1, systemType: 1 }, { unique: true });
