import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class NoteEntry {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const NoteEntrySchema = SchemaFactory.createForClass(NoteEntry);


@Schema({ _id: false })
export class MaterialItem {
  @Prop()
  profileName: string;

  @Prop()
  thickness: string;

  @Prop()
  quantityFeet: number;

  @Prop()
  pricePerFeet: number;

  @Prop()
  materialCost: number;
}

@Schema({ _id: false })
export class LaborData {
  @Prop()
  areaSqFt: number;

  @Prop()
  laborRate: number;

  @Prop()
  laborCost: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ unique: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  productType: string; // Window, Door, Cabinet, etc.

  @Prop({ enum: ['custom', 'catalogue'], default: 'custom' })
  designType: string;

  @Prop({
    enum: [
      'draft',
      'quotation_pending',
      'quotation_sent',
      'approved',
      'production',
      'installation',
      'completed',
      'cancelled',
    ],
    default: 'quotation_pending',
  })
  status: string;

  @Prop({ default: 0 })
  progress: number;

  @Prop()
  estimatedPrice: number;

  @Prop({ type: Object, default: {} })
  measurements: Record<string, any>;

  @Prop()
  purpose: string;

  @Prop()
  environment: string;

  @Prop()
  strengthCategory: string;

  @Prop({ type: [MaterialItem] })
  recommendedMaterials: MaterialItem[];

  @Prop({ type: LaborData })
  laborCalculation: LaborData;

  @Prop({ type: [NoteEntrySchema], default: [] })
  notes: NoteEntry[];

  @Prop({ type: [String] })
  attachments: string[];

  @Prop({ type: Types.ObjectId, ref: 'Quotation' })
  quotationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Design' })
  catalogueDesignId: Types.ObjectId;

  @Prop()
  color: string;

  @Prop({ type: [String] })
  accessories: string[];

  @Prop()
  finalMaterialCost: number;

  @Prop()
  finalLaborCost: number;

  @Prop()
  finalTotalCost: number;

  @Prop()
  quotationPdfUrl: string;

  @Prop()
  quotationSentAt: Date;

  @Prop()
  expectedCompletionDate: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
