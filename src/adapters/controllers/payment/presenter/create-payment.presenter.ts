import { ApiProperty } from '@nestjs/swagger'

export class InitiatePaymentPresenter {
  @ApiProperty({
    required: true,
    description: 'Client Secret từ Stripe Payment Intent',
  })
  clientSecret!: string

  @ApiProperty({ required: true, description: 'Public key của Stripe' })
  publishableKey!: string

  @ApiProperty({
    required: true,
    description: 'ID của bản ghi Payment vừa tạo trong DB của bạn',
  })
  paymentId!: number

  constructor({
    clientSecret,
    publishableKey,
    paymentId,
  }: InitiatePaymentPresenter) {
    this.clientSecret = clientSecret
    this.publishableKey = publishableKey
    this.paymentId = paymentId
  }
}
