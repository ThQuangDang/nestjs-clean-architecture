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

import { ReviewStatusEnum } from '@domain/entities/reviews.entity'

@ValidatorConstraint({ name: 'IsApproveOrReject', async: false })
export class IsApproveOrReject implements ValidatorConstraintInterface {
  validate(value: ReviewStatusEnum): boolean {
    return (
      value == ReviewStatusEnum.APPROVED || value == ReviewStatusEnum.REJECTED
    )
  }

  defaultMessage(): string {
    return 'Status must be either Approved or Rejected'
  }
}

export class UpdateStatusReivewDto {
  @ApiProperty({
    required: true,
    enum: ReviewStatusEnum,
    description: '1 = PENDING, 2 = APPROVED, 3 = REJECTED,',
  })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(ReviewStatusEnum)
  @Validate(IsApproveOrReject)
  status!: ReviewStatusEnum
}
