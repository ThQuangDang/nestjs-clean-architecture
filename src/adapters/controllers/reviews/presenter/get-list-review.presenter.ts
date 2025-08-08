import { ApiProperty } from '@nestjs/swagger'

import { ReviewStatusEnum } from '@domain/entities/reviews.entity'

import { CreateReviewPresenter } from './create-review.presenter'

export class GetListReviewPresenter extends CreateReviewPresenter {
  @ApiProperty()
  clientId: number

  @ApiProperty({
    required: true,
    enum: ReviewStatusEnum,
    description: '1: PENDING, 2: APPROVED, 3: REJECTED',
  })
  status: ReviewStatusEnum

  constructor({
    id,
    comment,
    rating,
    clientId,
    status,
    serviceId,
    providerId,
    appointmentId,
  }: GetListReviewPresenter) {
    super({ id, rating, comment, providerId, serviceId, appointmentId })
    this.clientId = clientId
    this.status = status
  }
}
