/* eslint-disable import/named */
import { ApiProperty } from '@nestjs/swagger'

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { RoleEnum } from '@domain/entities/user.entity'

@ValidatorConstraint({ name: 'IsProviderOrClient', async: false })
export class IsProviderOrClient implements ValidatorConstraintInterface {
  validate(value: RoleEnum): boolean {
    return value == RoleEnum.CLIENT || value == RoleEnum.PROVIDER
  }

  defaultMessage(): string {
    return 'Role must be either Client or Provider'
  }
}

export class RegisterDto {
  @ApiProperty({ required: true, format: 'username' })
  @IsNotEmpty()
  @IsString()
  username!: string

  @ApiProperty({ required: true, format: 'email' })
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty({ required: true, format: 'password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least 1 number',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least 1 special character',
  })
  password!: string

  @ApiProperty({ required: true, enum: RoleEnum })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  @Validate(IsProviderOrClient)
  role!: RoleEnum
}
