import { ApiProperty } from '@nestjs/swagger'

export class CreateReviewPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  rating: number

  @ApiProperty()
  comment?: string

  @ApiProperty()
  providerId: number

  @ApiProperty()
  serviceId: number

  @ApiProperty()
  appointmentId: number

  constructor({
    id,
    rating,
    comment,
    providerId,
    serviceId,
    appointmentId,
  }: CreateReviewPresenter) {
    this.id = id
    this.rating = rating
    this.comment = comment
    this.providerId = providerId
    this.serviceId = serviceId
    this.appointmentId = appointmentId
  }
}
