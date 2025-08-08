import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import { IsDate, IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator'

import { InvoiceStatusEnum } from '@domain/entities/invoices.entity'
import { ISearchInvoiceParam } from '@domain/repositories/invoice.repository.interface'

export class GetListInvoiceDto implements ISearchInvoiceParam {
  @ApiProperty({
    required: false,
    enum: InvoiceStatusEnum,
    description: '1 = PENDING, 2 = PAID, 3 = CANCELED, 4 = REFUNDED',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsOptional()
  @IsEnum(InvoiceStatusEnum)
  status?: InvoiceStatusEnum

  @ApiProperty({
    required: false,
    type: Date,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  inDate?: Date

  @ApiProperty({
    required: false,
    enum: ['createdAt', 'issuedDate'],
  })
  @IsIn(['createdAt', 'issuedDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'issuedDate' = 'createdAt'

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
  appointmentId?: number
}
