
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(senderId: string, receiverId: string, content: string, orderId?: string): Promise<MessageDocument> {
    const newMessage = new this.messageModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      content,
      orderId: orderId ? new Types.ObjectId(orderId) : undefined,
    });
    return newMessage.save();
  }

  async findConversation(user1: string, user2: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findUserConversations(userId: string): Promise<any[]> {
    return this.messageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: new Types.ObjectId(userId) }, { receiverId: new Types.ObjectId(userId) }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$content' },
          timestamp: { $first: '$createdAt' },
          isRead: { $first: '$isRead' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          timestamp: 1,
          isRead: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.role': 1,
        },
      },
    ]);
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, { isRead: true });
  }
}
