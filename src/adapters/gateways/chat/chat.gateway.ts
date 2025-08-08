import { Injectable } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { Server, Socket } from 'socket.io'

import { CreateChatUseCase } from '@use-cases/chat/create-chat.use-case'
import { EditChatMessageUseCase } from '@use-cases/chat/edit-chat-message.use-case'
import { UpdateChatReadUseCase } from '@use-cases/chat/update-chat-read.use-case'

import { CreateChatDto } from './dto/create-chat.dto'
import { UpdateChatMessageDto } from './dto/update-chat-message.dto'
import { UpdateChatReadDto } from './dto/update-chat-read.dto'
import { CreateChatPresenter } from './presenter/create-chat.presenter'
import { UpdateChatMessagePresenter } from './presenter/update-chat-message.presenter'
import { UpdateChatReadPresenter } from './presenter/update-chat-read.presenter'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly createChatUseCase: CreateChatUseCase,
    private readonly updateChatReadUseCase: UpdateChatReadUseCase,
    private readonly editChatMessageUseCase: EditChatMessageUseCase,
  ) {}
  @WebSocketServer()
  server!: Server

  private connectedUsers = new Map<number, string>()

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client)

    if (userId) this.connectedUsers.set(userId, client.id)
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0]

    if (userId) this.connectedUsers.delete(userId)
  }

  @SubscribeMessage('chat.send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateChatDto,
  ) {
    try {
      const fromUserId = this.getUserIdFromSocket(client)

      const chat = await this.createChatUseCase.execute({
        fromUserId,
        toUserId: payload.toUserId,
        message: payload.message,
      })

      client.emit('chat.sent', new CreateChatPresenter(chat))

      const receiverSocketId = this.connectedUsers.get(payload.toUserId)

      if (receiverSocketId)
        this.server
          .to(receiverSocketId)
          .emit('chat.receive', new CreateChatPresenter(chat))
    } catch (error) {
      client.emit('chat.error', {
        message: error,
      })
    }
  }

  @SubscribeMessage('chat.read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateChatReadDto,
  ) {
    try {
      const userId = this.getUserIdFromSocket(client)

      const updateChat = await this.updateChatReadUseCase.execute({
        chatIds: payload.chatIds,
        receiverId: payload.receiverId,
        senderId: userId,
      })

      client.emit('chat.read', {
        updated: new UpdateChatReadPresenter(updateChat),
      })
    } catch (error) {
      client.emit('chat.error', {
        message: error,
      })
    }
  }

  @SubscribeMessage('chat.update')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateChatMessageDto,
  ) {
    try {
      const userId = this.getUserIdFromSocket(client)

      const updatedChat = await this.editChatMessageUseCase.execute({
        userId,
        chatId: payload.chatId,
        message: payload.newMessage,
      })

      const receiverId = updatedChat.receiverId
      const receiverSocketId = this.connectedUsers.get(receiverId)
      const senderSocketId = this.connectedUsers.get(userId)

      if (senderSocketId) {
        this.server
          .to(senderSocketId)
          .emit('chat.updated', new UpdateChatMessagePresenter(updatedChat))
      }
      if (receiverSocketId && receiverSocketId !== senderSocketId) {
        this.server
          .to(receiverSocketId)
          .emit('chat.updated', new UpdateChatMessagePresenter(updatedChat))
      }
    } catch (error) {
      client.emit('chat.error', {
        message: error,
      })
    }
  }

  private getUserIdFromSocket(client: Socket): number {
    const userId = Number(client.handshake.query.userId)
    if (!userId || isNaN(userId)) {
      client.disconnect()
      throw new Error('Invalid userId in socket connection')
    }
    return userId
  }
}
