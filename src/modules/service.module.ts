import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { SERVICE_REPOSITORY } from '@domain/repositories/service.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'

import { CreateServiceUseCase } from '@use-cases/services/create-service.use-case'
import { GetDetailServiceUseCase } from '@use-cases/services/get-detail-service.use-case'
import { GetListServiceUseCase } from '@use-cases/services/get-list-service.use-case'
import { UpdateServiceUseCase } from '@use-cases/services/update-service.use-case'

import { ServicesController } from '@adapters/controllers/services/services.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { ServiceRepository } from '@infrastructure/databases/postgressql/repositories/service.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Service, User])],
  controllers: [ServicesController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
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
    CreateServiceUseCase,
    UpdateServiceUseCase,
    GetDetailServiceUseCase,
    GetListServiceUseCase,
    CaslAbilityFactory,
  ],
})
export class ServicesModule {}
