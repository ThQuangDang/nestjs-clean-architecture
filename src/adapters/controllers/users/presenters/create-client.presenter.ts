import { ApiProperty } from '@nestjs/swagger'

export class CreateClientPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  fullName: string

  @ApiProperty()
  description?: string

  constructor({ id, fullName, description }: CreateClientPresenter) {
    this.id = id
    this.fullName = fullName
    this.description = description
  }
}
