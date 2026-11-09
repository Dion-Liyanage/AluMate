import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiConversationDocument = HydratedDocument<AiConversation>;

/** A catalogue design the assistant referred to, shown as a card under its reply. */
@Schema({ _id: false })
export class AiDesignRef {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  designCode: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  category?: string;

  @Prop()
  imageUrl?: string;
}
export const AiDesignRefSchema = SchemaFactory.createForClass(AiDesignRef);

@Schema({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
export class AiMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ default: '' })
  text: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [AiDesignRefSchema], default: [] })
  designs: AiDesignRef[];

  createdAt?: Date;
}
export const AiMessageSchema = SchemaFactory.createForClass(AiMessage);

@Schema({ timestamps: true })
export class AiConversation {
  /** Set when the customer is logged in; anonymous visitors have no user. */
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  user?: Types.ObjectId;

  @Prop({ type: [AiMessageSchema], default: [] })
  messages: AiMessage[];
}

export const AiConversationSchema = SchemaFactory.createForClass(AiConversation);
