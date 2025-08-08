import { RoleEnum } from '@domain/entities/user.entity'

export class RoleUtils {
  private static readonly roleUserMap: Record<RoleEnum, string> = {
    [RoleEnum.ADMIN]: 'Admin',
    [RoleEnum.CLIENT]: 'Client',
    [RoleEnum.PROVIDER]: 'Provider',
  }

  static getRoleName(role: RoleEnum): string {
    return this.roleUserMap[role] || ''
  }
}
