import { ApiProperty } from '@nestjs/swagger'

export class CreateProviderPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  businessName: string

  @ApiProperty()
  description?: string

  constructor({ id, businessName, description }: CreateProviderPresenter) {
    this.id = id
    this.businessName = businessName
    this.description = description
  }
}
