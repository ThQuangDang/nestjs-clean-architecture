import { ApiProperty } from '@nestjs/swagger'

import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty, MinDate } from 'class-validator'

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Time to meet with provider',
    type: Date,
    required: true,
    example: '2025-05-01T10:00:00.000',
  })
  @IsNotEmpty()
  @IsDate()
  @MinDate(new Date(new Date().getTime() + 10 * 60 * 1000), {
    message: 'appointmentTime must be in the future',
  })
  @Type(() => Date)
  appointmentTime!: Date
}
