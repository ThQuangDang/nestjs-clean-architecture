import { ApiProperty } from '@nestjs/swagger'

export class UpdateAppointmentTimePresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update appointment time successfully'
      : 'Update appointment time failed'
  }
}
