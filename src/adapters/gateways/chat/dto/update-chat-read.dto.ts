import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator'

export class UpdateChatReadDto {
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  chatIds!: number[]

  @IsNotEmpty()
  @IsNumber()
  receiverId!: number
}
