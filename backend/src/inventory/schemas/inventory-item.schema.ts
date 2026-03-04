import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryItemDocument = HydratedDocument<InventoryItem>;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ enum: ['raw-material', 'finished-product'], required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ required: true })
  unit: string;

  @Prop()
  unitPrice: number;

  @Prop({ required: true, default: 0 })
  reorderLevel: number;

  @Prop()
  supplier: string;

  @Prop()
  location: string;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);

// Indexes
InventoryItemSchema.index({ category: 1 });
InventoryItemSchema.index({ name: 1 });
