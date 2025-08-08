export enum RoleEnum {
  ADMIN = 1,
  PROVIDER = 2,
  CLIENT = 3,
}

export enum UserStatusEnum {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export class UserEntity {
  public readonly id!: number
  public username!: string
  public email!: string
  password!: string
  public lastLogin?: Date
  public role!: RoleEnum
  public status!: UserStatusEnum
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
