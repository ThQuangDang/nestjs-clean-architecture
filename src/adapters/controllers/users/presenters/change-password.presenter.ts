import { ApiProperty } from '@nestjs/swagger'

export class ChangePasswordPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Password changed successfully'
      : 'Password update failed. Please try again later'
  }
}
