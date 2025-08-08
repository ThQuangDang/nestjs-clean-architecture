import { ApiProperty } from '@nestjs/swagger'

import { RoleEnum, UserStatusEnum } from '@domain/entities/user.entity'

export class RegisterPresenter {
  @ApiProperty()
  id!: number

  @ApiProperty({ required: true })
  username!: string

  @ApiProperty({ required: true })
  email!: string

  @ApiProperty({ required: true })
  role!: RoleEnum

  @ApiProperty({ required: true })
  status!: UserStatusEnum

  constructor(user: {
    id: number
    username: string
    email: string
    role: RoleEnum
    status: UserStatusEnum
  }) {
    this.id = user.id
    this.username = user.username
    this.email = user.email
    this.role = user.role
    this.status = user.status
  }
}
