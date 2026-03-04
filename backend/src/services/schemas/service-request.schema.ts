import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServiceRequestDocument = HydratedDocument<ServiceRequest>;

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ enum: ['maintenance', 'repair', 'installation'], required: true })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    enum: ['pending', 'scheduled', 'in-progress', 'completed'],
    default: 'pending',
  })
  status: string;

  @Prop()
  scheduledDate: Date;

  @Prop()
  completedDate: Date;

  @Prop()
  assignedTo: string;

  @Prop()
  notes: string;
}

export const ServiceRequestSchema =
  SchemaFactory.createForClass(ServiceRequest);

// Indexes
ServiceRequestSchema.index({ customerId: 1 });
ServiceRequestSchema.index({ status: 1 });
