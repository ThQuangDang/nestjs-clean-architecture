import { ApiProperty } from '@nestjs/swagger'

export class UpdateAppointmentPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update appointment successfully'
      : 'Update appointment failed'
  }
}
