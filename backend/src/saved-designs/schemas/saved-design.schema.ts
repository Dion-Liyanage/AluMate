import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SavedDesignDocument = HydratedDocument<SavedDesign>;

/**
 * A customer's work-in-progress design from the design studio.
 *
 * `designId` is the id the browser generated when the design was first saved.
 * Keeping it (instead of using _id) means designs imported from the old
 * localStorage storage keep their ids, so existing studio/quote links work.
 */
@Schema()
export class SavedDesign {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  designId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  productType: string;

  // Fabric.js canvas JSON (stringified)
  @Prop({ required: true })
  designJson: string;

  // PNG data URL of the canvas
  @Prop({ default: '' })
  previewImage: string;

  @Prop()
  description?: string;

  // Managed by the service rather than mongoose timestamps so imported
  // designs keep their original dates.
  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const SavedDesignSchema = SchemaFactory.createForClass(SavedDesign);

SavedDesignSchema.index({ userId: 1, designId: 1 }, { unique: true });
SavedDesignSchema.index({ userId: 1, updatedAt: -1 });
