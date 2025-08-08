import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateChatMessageDto {
  @IsNotEmpty()
  @IsNumber()
  chatId!: number

  @IsNotEmpty()
  @IsString()
  newMessage!: string
}
