
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your FRONTEND_URL
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  // Map to track connected users and their socket IDs
  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      console.log(`User connected: ${userId} with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove the user from our tracking map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string; orderId?: string },
  ) {
    const senderId = client.handshake.query.userId as string;
    
    // 1. Save message to database
    const message = await this.messagesService.create(
      senderId,
      data.receiverId,
      data.content,
      data.orderId,
    );

    // 2. Send to receiver if online
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receive_message', message);
    }

    // 3. Send back to sender for confirmation
    client.emit('message_sent', message);

    return message;
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string },
  ) {
    const userId = client.handshake.query.userId as string;
    const history = await this.messagesService.findConversation(userId, data.otherUserId);
    client.emit('conversation_history', history);
  }
}
