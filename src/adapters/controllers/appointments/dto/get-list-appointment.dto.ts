import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import { IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator'

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'
import { ISearchAppointmentParam } from '@domain/repositories/appointment.repository.interface'

export class GetListAppointmentDto implements ISearchAppointmentParam {
  @ApiProperty({
    required: false,
    enum: AppointmentStatusEnum,
    description: '1 = PENDING, 2 = CONFIRMED, 3 = COMPLETED, 4 = CANCELED,',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(AppointmentStatusEnum)
  @IsOptional()
  status?: AppointmentStatusEnum

  @ApiProperty({
    required: false,
    enum: PaymentStatusEnum,
    description: '1 = PENDING, 2 = COMPLETED, 3 = FAILED, 4 = REFUNDED,',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(PaymentStatusEnum)
  @IsOptional()
  paymentStatus?: PaymentStatusEnum

  @ApiProperty({
    required: false,
    enum: ['createdAt', 'appointmentTime'],
  })
  @IsIn(['createdAt', 'appointmentTime'])
  @IsOptional()
  sortBy?: 'createdAt' | 'appointmentTime' = 'createdAt'

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  providerId?: number

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number
}
