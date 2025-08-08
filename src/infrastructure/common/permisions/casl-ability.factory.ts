/* eslint-disable import/named */
import { Injectable } from '@nestjs/common'

import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability'

import { RoleEnum } from '@domain/entities/user.entity'

import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Invoice } from '@infrastructure/databases/postgressql/entities/invoices.entity'
import { Payment } from '@infrastructure/databases/postgressql/entities/payments.entity'
import { Promotion } from '@infrastructure/databases/postgressql/entities/promotions.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { RefundRequest } from '@infrastructure/databases/postgressql/entities/refund_request.entity'
import { Revenue } from '@infrastructure/databases/postgressql/entities/revenues.entity'
import { Review } from '@infrastructure/databases/postgressql/entities/reviews.entity'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

export enum ActionEnum {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  UpdateStatus = 'updatestatus',
}

export type TSubjects =
  | InferSubjects<
      | typeof User
      | typeof Provider
      | typeof Client
      | typeof Service
      | typeof Promotion
      | typeof Appointment
      | typeof Invoice
      | typeof Payment
      | typeof Revenue
      | typeof Review
      | typeof RefundRequest
    >
  | 'all'
export type TAppAbility = Ability<[ActionEnum, TSubjects]>

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<TAppAbility>(
      Ability as AbilityClass<TAppAbility>,
    )

    if (user.role === RoleEnum.ADMIN) {
      can(ActionEnum.Manage, 'all')
    } else if (user.role === RoleEnum.PROVIDER) {
      can(ActionEnum.Create, Provider)
      can(ActionEnum.Read, Provider)
      can(ActionEnum.Update, Provider)
      cannot(ActionEnum.Delete, Provider)

      can(ActionEnum.Create, Service)
      can(ActionEnum.Update, Service)
      can(ActionEnum.Delete, Service)

      can(ActionEnum.Create, Promotion)
      can(ActionEnum.Update, Promotion)
      can(ActionEnum.Delete, Promotion)

      can(ActionEnum.UpdateStatus, Appointment)

      can(ActionEnum.Read, Revenue)
    } else if (user.role === RoleEnum.CLIENT) {
      can(ActionEnum.Create, Client)
      can(ActionEnum.Read, Client)
      can(ActionEnum.Update, Client)
      cannot(ActionEnum.Delete, Client)

      can(ActionEnum.Create, Appointment)
      can(ActionEnum.UpdateStatus, Appointment)
      can(ActionEnum.Update, Appointment)

      can(ActionEnum.Create, Invoice)
      can(ActionEnum.Update, Invoice)

      can(ActionEnum.Create, Payment)

      can(ActionEnum.Create, Review)
      can(ActionEnum.Update, Review)

      can(ActionEnum.Create, RefundRequest)
      can(ActionEnum.Read, RefundRequest)
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<TSubjects>,
    })
  }
}
