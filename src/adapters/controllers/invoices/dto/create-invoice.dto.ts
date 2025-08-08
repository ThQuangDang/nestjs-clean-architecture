import { ApiProperty } from '@nestjs/swagger'

import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Promotional code entered by the customer',
    type: [String],
    required: false,
    maxLength: 255,
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  promotionCode?: string[]
}
