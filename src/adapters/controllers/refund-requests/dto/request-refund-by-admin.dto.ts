/* eslint-disable import/named */
import { ApiProperty } from '@nestjs/swagger'

import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { RefundStatusEnum } from '@domain/entities/refund_request.entity'

@ValidatorConstraint({ name: 'IsApprovedOrRejected', async: false })
export class IsApprovedOrRejected implements ValidatorConstraintInterface {
  validate(value: RefundStatusEnum): boolean {
    return (
      value == RefundStatusEnum.APPROVED || value == RefundStatusEnum.REJECTED
    )
  }
  defaultMessage(): string {
    return 'Refund status must be either Approv or Reject'
  }
}

export class RequestRefundByAdminDto {
  @ApiProperty({
    required: true,
    enum: RefundStatusEnum,
    description: '3 = APPROVED, 4 = REJECTED,',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsNotEmpty()
  @IsEnum(RefundStatusEnum)
  @Validate(IsApprovedOrRejected)
  refundStatus!: RefundStatusEnum

  @ApiProperty({
    required: true,
    maxLength: 20000,
  })
  @IsString()
  @MaxLength(20000)
  @IsOptional()
  rejectReason?: string
}
