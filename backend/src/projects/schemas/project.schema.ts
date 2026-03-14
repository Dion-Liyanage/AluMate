import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ type: [FeedbackSchema], default: [] })
  feedbacks: Feedback[];

  @Prop()
  location?: string;

  @Prop()
  materialUsed?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  completedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
