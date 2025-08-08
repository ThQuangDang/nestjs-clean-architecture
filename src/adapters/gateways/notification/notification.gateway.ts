import { Injectable } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { Server, Socket } from 'socket.io'

import { NotificationEntity } from '@domain/entities/notifications.entity'

import { NotificationPresenter } from './presenters/notification.presenter'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notification',
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server

  private connectedUsers = new Map<number, string>()

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId)
    if (userId) this.connectedUsers.set(userId, client.id)
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0]

    if (userId) this.connectedUsers.delete(userId)
  }

  sendNotificationToUser(
    userId: number | string,
    notification: NotificationEntity,
  ) {
    const numericUserId = Number(userId)
    const socketId = this.connectedUsers.get(numericUserId)

    if (socketId) {
      const data = new NotificationPresenter(notification)
      this.server.to(socketId).emit('notification', data)
    }
  }
}
