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

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'

@ValidatorConstraint({ name: 'IsStatusAppointment', async: false })
export class IsStatusAppointment implements ValidatorConstraintInterface {
  validate(value: AppointmentStatusEnum): boolean {
    return (
      value == AppointmentStatusEnum.CONFIRMED ||
      value == AppointmentStatusEnum.CANCELED
    )
  }

  defaultMessage(): string {
    return 'Status appointment must be either Confirmed or Canceled'
  }
}

export class UpdateStatusAppointmentDto {
  @ApiProperty({
    required: true,
    enum: AppointmentStatusEnum,
    description: '1 = PENDING ,2 = CONFIRMED ,3 = COMPLETED , 4 = CANCELED',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(AppointmentStatusEnum)
  @IsNotEmpty()
  @Validate(IsStatusAppointment)
  status!: AppointmentStatusEnum

  @ApiProperty({
    required: false,
    description: 'Reason canceled appointment by provider',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsOptional()
  @IsString()
  cancelReason?: string
}
