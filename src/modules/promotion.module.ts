import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { PROMOTION_SERVICE_REPOSITORY } from '@domain/repositories/promotion-service.repository.interface'
import { PROMOTION_REPOSITORY } from '@domain/repositories/promotion.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { SERVICE_REPOSITORY } from '@domain/repositories/service.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'

import { CreatePromotionUseCase } from '@use-cases/promotions/create-promotion.use-case'
import { GetDetailPromotionUseCase } from '@use-cases/promotions/get-detail-promotion.use-case'
import { GetListPromotionUseCase } from '@use-cases/promotions/get-list-promotion.use-case'
import { UpdatePromotionUseCase } from '@use-cases/promotions/update-promotion.use-case'

import {
  IsDiscountCode,
  IsStartDateBeforeEndDate,
} from '@adapters/controllers/promotions/dto/create-promotion.dto'
import { PromotionController } from '@adapters/controllers/promotions/promotions.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { Promotion } from '@infrastructure/databases/postgressql/entities/promotions.entity'
import { PromotionsServices } from '@infrastructure/databases/postgressql/entities/promotions_services.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { PromotionServiceRepository } from '@infrastructure/databases/postgressql/repositories/promotion-service.repository'
import { PromotionRepository } from '@infrastructure/databases/postgressql/repositories/promotion.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { ServiceRepository } from '@infrastructure/databases/postgressql/repositories/service.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { PromotionCronModule } from '@infrastructure/services/cron/promotion-cron.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Promotion,
      PromotionsServices,
      Provider,
      Service,
      User,
    ]),
    PromotionCronModule,
  ],
  controllers: [PromotionController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PROMOTION_REPOSITORY,
      useClass: PromotionRepository,
    },
    {
      provide: PROMOTION_SERVICE_REPOSITORY,
      useClass: PromotionServiceRepository,
    },
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    CreatePromotionUseCase,
    UpdatePromotionUseCase,
    GetDetailPromotionUseCase,
    GetListPromotionUseCase,
    IsStartDateBeforeEndDate,
    IsDiscountCode,
    CaslAbilityFactory,
  ],
})
export class PromotionModule {}
