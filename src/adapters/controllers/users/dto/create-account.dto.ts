import { ApiProperty } from '@nestjs/swagger'

import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator'

import { RoleEnum } from '@domain/entities/user.entity'

export class CreateAccountDto {
  @ApiProperty({ required: true, format: 'username' })
  @IsNotEmpty()
  @IsString()
  username!: string

  @ApiProperty({ required: true, format: 'email' })
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty({ required: true, enum: RoleEnum })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role!: RoleEnum
}
