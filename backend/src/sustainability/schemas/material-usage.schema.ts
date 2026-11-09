import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MaterialUsageDocument = HydratedDocument<MaterialUsage>;

@Schema({ timestamps: true })
export class MaterialUsage {
  @Prop({ type: Types.ObjectId, ref: 'Order', unique: true, sparse: true })
  orderId?: Types.ObjectId;

  @Prop()
  orderNumber?: string;

  @Prop({ required: true, trim: true })
  projectName: string;

  @Prop({ required: true, min: 0 })
  purchasedKg: number;

  @Prop({ required: true, min: 0 })
  usedKg: number;

  @Prop({ required: true, min: 0 })
  reusableOffcutsKg: number;

  @Prop({ required: true, min: 0 })
  scrapWasteKg: number;

  @Prop({ required: true, min: 0 })
  totalCost: number;

  @Prop({ required: true, min: 0 })
  costPerKg: number;

  @Prop({ default: Date.now })
  recordedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recordedBy: Types.ObjectId;
}

export const MaterialUsageSchema = SchemaFactory.createForClass(MaterialUsage);

MaterialUsageSchema.index({ recordedAt: -1 });
MaterialUsageSchema.index({ projectName: 1, recordedAt: -1 });
