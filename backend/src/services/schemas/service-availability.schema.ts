import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceAvailabilityDocument = HydratedDocument<ServiceAvailability>;

@Schema({ timestamps: true })
export class ServiceAvailability {
  @Prop({ required: true, unique: true })
  date: string;

  @Prop({ type: [String], default: [] })
  slots: string[];
}

export const ServiceAvailabilitySchema = SchemaFactory.createForClass(ServiceAvailability);
ServiceAvailabilitySchema.index({ date: 1 }, { unique: true });
