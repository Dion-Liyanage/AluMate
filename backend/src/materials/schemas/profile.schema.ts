import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

export const PROFILE_SHAPES = [
  'frame',
  'track',
  'jamb',
  'sash',
  'interlock',
  'mullion',
  'transom',
  'rail',
  'bead',
  'box',
  'other',
] as const;

/** An aluminium extrusion the workshop buys as stock bars. */
@Schema({ timestamps: true })
export class Profile {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  /** Profile system / series, e.g. "70mm Sliding" */
  @Prop({ required: true, trim: true })
  series: string;

  @Prop({ required: true, enum: PROFILE_SHAPES })
  shape: string;

  @Prop({ required: true, min: 0 })
  thicknessMm: number;

  @Prop({ required: true, min: 0 })
  weightKgPerM: number;

  /** Length of the stock bar supplied, in feet */
  @Prop({ required: true, min: 1 })
  barLengthFt: number;

  @Prop({ required: true, min: 0 })
  pricePerFt: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSample: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
