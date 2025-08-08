import { ChatEntity } from '@domain/entities/chats.entity'

export const CHAT_REPOSITORY = 'CHAT_REPOSITORY_INTERFACE'

export interface ISearchChatParam {
  search?: string
  isRead?: boolean
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

export interface IChatRepository {
  create(data: Partial<ChatEntity>): ChatEntity
  save(entity: ChatEntity): Promise<ChatEntity>
  markChatsAsRead(
    chatIds: number[],
    userId: number,
    senderId: number,
  ): Promise<boolean>
  findChatById(id: number): Promise<ChatEntity | null>
  findChats(
    params: ISearchChatParam & { userId: number },
  ): Promise<ChatEntity[]>
}
