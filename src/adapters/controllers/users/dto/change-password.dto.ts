import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ required: true, description: 'Old password' })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string

  @ApiProperty({ required: true, description: 'New password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string
}
