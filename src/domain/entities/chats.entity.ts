export class ChatEntity {
  public readonly id!: number
  public senderId!: number
  public receiverId!: number
  public message!: string
  public isRead!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
