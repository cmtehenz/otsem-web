// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Libera CORS para qualquer origem — pode ajustar depois
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server?: Server;

  // Envia uma notificação para todos conectados
  sendNotification(message: string) {
    this.server?.emit('notification', message);
  }

  // Apenas para testes: recebe mensagens do front
  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: string): string {
    return 'pong: ' + data;
  }
}