// src/socket/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server?: Server;

  handleConnection(client: Socket) {
    this.logger.log('✅ Cliente conectado: ${client.id}');
  }

  handleDisconnect(client: Socket) {
    this.logger.warn('⛔ Cliente desconectado: ${client.id}');
  }

  @SubscribeMessage('mensagem')
  handleMessage(@MessageBody() data: string): string {
    this.logger.log('📩 Mensagem recebida: ${data}');
    return 'Servidor recebeu: ${data}';
  }
}