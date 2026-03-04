import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuotationDocument = HydratedDocument<Quotation>;

@Schema()
export class QuotationItem {
  @Prop({ required: true })
  description: string;

  @Prop()
  material: string;

  @Prop()
  dimensions: string;

  @Prop()
  quantity: number;

  @Prop()
  unitPrice: number;

  @Prop()
  totalPrice: number;
}

export const QuotationItemSchema = SchemaFactory.createForClass(QuotationItem);

@Schema({ timestamps: true })
export class Quotation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ type: [QuotationItemSchema], default: [] })
  items: QuotationItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    enum: ['draft', 'sent', 'accepted', 'rejected'],
    default: 'draft',
  })
  status: string;

  @Prop({ required: true })
  validUntil: Date;

  @Prop()
  notes: string;
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation);

// Indexes
QuotationSchema.index({ customerId: 1 });
QuotationSchema.index({ orderId: 1 });
