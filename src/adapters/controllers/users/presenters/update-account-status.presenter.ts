import { ApiProperty } from '@nestjs/swagger'

export class UPdateAccountStatusPresenter {
  @ApiProperty({ required: true })
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update account status successfull '
      : ' Update account status failed'
  }
}
