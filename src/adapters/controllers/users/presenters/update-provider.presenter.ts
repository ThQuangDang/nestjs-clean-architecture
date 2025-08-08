import { ApiProperty } from '@nestjs/swagger'

export class UpdateProviderPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update provider successfully'
      : 'Update provider failed'
  }
}
