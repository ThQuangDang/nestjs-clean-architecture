import {
  RoleEnum,
  UserEntity,
  UserStatusEnum,
} from '@domain/entities/user.entity'

export interface ISearchUserParams {
  status?: UserStatusEnum
  role?: RoleEnum
  dateLogin?: Date
  sortBy?: 'createdAt' | 'name' | 'id'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
  userId?: number
}

export const USER_REPOSITORY = 'USER_REPOSITORY_INTERFACE'
export interface IUserRepository {
  getUserByUsername(username: string): Promise<UserEntity | null>
  getUserById(id: number): Promise<UserEntity | null>
  updateLastLogin(id: number): Promise<void>
  getUserByEmail(email: string): Promise<UserEntity | null>
  createUser(data: Partial<UserEntity>): Promise<UserEntity>
  updateUser(userId: number, data: Partial<UserEntity>): Promise<boolean>
  getAdminUser(): Promise<UserEntity[]>
  findUsers(data: Partial<ISearchUserParams>): Promise<UserEntity[]>
}
