import { ApiProperty } from '@nestjs/swagger'

export class UpdateReviewPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update review successfully'
      : 'Update review failed'
  }
}
