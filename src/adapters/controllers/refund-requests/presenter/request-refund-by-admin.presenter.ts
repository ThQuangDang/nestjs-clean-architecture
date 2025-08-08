import { ApiProperty } from '@nestjs/swagger'

export class RequestRefundByAdminPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update refund status successfully'
      : 'Update refund status failed'
  }
}
