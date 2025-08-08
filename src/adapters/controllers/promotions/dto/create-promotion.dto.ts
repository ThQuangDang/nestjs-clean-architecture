/* eslint-disable import/named */
import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { CreatePromotionServiceDto } from './create-promotion-service.dto'

@ValidatorConstraint({ name: 'IsStartDateBeforeEndDate', async: false })
export class IsStartDateBeforeEndDate implements ValidatorConstraintInterface {
  validate(endDate: Date, args: ValidationArguments): boolean {
    const obj = args.object as CreatePromotionDto
    const startDate: Date = obj.startDate

    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      return false
    }

    return startDate < endDate
  }

  defaultMessage(): string {
    return 'Start date must be before end date'
  }
}

@ValidatorConstraint({ name: 'IsDiscountCode', async: false })
export class IsDiscountCode implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const spaceCount = (value.match(/__/g) || []).length

    return spaceCount <= 1
  }

  defaultMessage(): string {
    return 'Discount code must contain at most one space'
  }
}

export class CreatePromotionDto {
  @ApiProperty({
    required: true,
    maxLength: 225,
    description: 'Name promotion',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string

  @ApiProperty({
    required: true,
    maximum: 100,
    minimum: 5,
    description: 'Discount',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(5)
  @Max(100)
  discount!: number

  @ApiProperty({
    required: true,
    maxLength: 225,
    description: 'Discount code',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Validate(IsDiscountCode)
  @Transform(({ value }: { value: string }) =>
    value.trim().replace(/\s/g, '_').toUpperCase(),
  )
  discountCode!: string

  @ApiProperty({
    required: true,
    minimum: 1,
    description: 'Max discount client used',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  maxUsage!: number

  @ApiProperty({
    required: true,
    type: Date,
    description: 'start date discount used',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate!: Date

  @ApiProperty({
    required: true,
    type: Date,
    description: 'end date discount used',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Validate(IsStartDateBeforeEndDate)
  endDate!: Date

  @ApiProperty({
    required: true,
    description: '',
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePromotionServiceDto)
  serviceIds!: CreatePromotionServiceDto[]
}
