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

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  materialType: string;

  @Prop()
  dimensions: string;

  @Prop()
  quantity: number;

  @Prop({
    enum: ['pending', 'quoted', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Quotation' })
  quotationId: Types.ObjectId;

  @Prop()
  assignedTo: string;

  @Prop()
  totalAmount: number;

  @Prop({ type: [NoteEntrySchema], default: [] })
  notes: NoteEntry[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
