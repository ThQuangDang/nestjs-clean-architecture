/* eslint-disable import/named */
import { ApiProperty } from '@nestjs/swagger'

import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { UserStatusEnum } from '@domain/entities/user.entity'

@ValidatorConstraint({ name: 'IsApproveOrRejectAccount', async: false })
export class IsApproveOrRejectAccount implements ValidatorConstraintInterface {
  validate(value: UserStatusEnum): boolean {
    return value == UserStatusEnum.APPROVED || value == UserStatusEnum.REJECTED
  }

  defaultMessage(): string {
    return 'Status must be either Approved or Rejected'
  }
}

export class UpdateAccountStatusDto {
  @ApiProperty({
    required: true,
    enum: UserStatusEnum,
    description: '1 = PENDING, 2 = APPROVED, 3 = REJECTED,',
  })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(UserStatusEnum)
  @Validate(IsApproveOrRejectAccount)
  status!: UserStatusEnum
}
