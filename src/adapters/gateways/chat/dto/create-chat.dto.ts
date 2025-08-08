import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateChatDto {
  @IsNotEmpty()
  @IsNumber()
  toUserId!: number

  @IsNotEmpty()
  @IsString()
  message!: string
}
