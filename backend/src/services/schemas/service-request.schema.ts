import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServiceRequestDocument = HydratedDocument<ServiceRequest>;

// Embedded sub-schema for geographic coordinates
class Location {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;
}

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ enum: ['on-site-visit', 'repair'], required: true })
  serviceType: string;

  @Prop({
    enum: [
      'Request Sent',
      'Pending',
      'Approved',
      'In Progress',
      'Completed',
      'Rejected',
    ],
    default: 'Request Sent',
  })
  status: string;

  @Prop({ required: true })
  date: string;

  // ── On-Site Visit specific fields ──
  @Prop()
  timeSlot: string;

  @Prop()
  contactNumber: string;

  @Prop()
  nearestTown: string;

  @Prop({ type: Object })
  location: Location;

  @Prop()
  manualAddress: string;

  // ── Repair specific fields ──
  @Prop()
  orderId: string;

  @Prop()
  issueDescription: string;

  @Prop()
  imageUrl: string;

  // ── Admin fields ──
  @Prop()
  adminNotes: string;
}

export const ServiceRequestSchema =
  SchemaFactory.createForClass(ServiceRequest);

// Indexes
ServiceRequestSchema.index({ customerId: 1 });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ serviceType: 1 });
