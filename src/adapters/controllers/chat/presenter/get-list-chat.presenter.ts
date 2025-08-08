import { ApiProperty } from '@nestjs/swagger'

export class GetListChatPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  message: string

  @ApiProperty()
  senderId: number

  @ApiProperty()
  receiverId: number

  @ApiProperty()
  isRead: boolean

  constructor({
    id,
    message,
    senderId,
    receiverId,
    isRead,
  }: GetListChatPresenter) {
    this.id = id
    this.message = message
    this.senderId = senderId
    this.receiverId = receiverId
    this.isRead = isRead
  }
}
