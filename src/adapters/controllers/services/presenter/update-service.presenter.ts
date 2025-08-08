import { ApiProperty } from '@nestjs/swagger'

export class UpdateServicePresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update service successfully'
      : 'Update service failed'
  }
}
