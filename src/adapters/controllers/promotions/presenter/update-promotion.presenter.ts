import { ApiProperty } from '@nestjs/swagger'

export class UpdatePromotionPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update promotion successfully'
      : 'Update promotion failed'
  }
}
