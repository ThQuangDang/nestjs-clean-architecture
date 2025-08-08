export class CreateChatPresenter {
  id: number
  senderId: number
  receiverId: number
  message: string
  isRead: boolean

  constructor({
    id,
    senderId,
    receiverId,
    message,
    isRead,
  }: CreateChatPresenter) {
    this.id = id
    this.senderId = senderId
    this.receiverId = receiverId
    this.message = message
    this.isRead = isRead
  }
}
