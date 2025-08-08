import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { APPOINTMENT_REPOSITORY } from '@domain/repositories/appointment.repository.interface'
import { CLIENT_REPOSITORY } from '@domain/repositories/client.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { REVIEW_REPOSITORY } from '@domain/repositories/review.repository.interface'
import { SERVICE_REPOSITORY } from '@domain/repositories/service.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'

import { CreateReviewUseCase } from '@use-cases/reviews/create-review.use-case'
import { GetDetailReviewUseCase } from '@use-cases/reviews/get-detail-review.use-case'
import { GetListReviewUseCase } from '@use-cases/reviews/get-list-review.use-case'
import { UpdateReviewUseCase } from '@use-cases/reviews/update-review.use-case'
import { UdpateStatusReviewUseCase } from '@use-cases/reviews/update-status-review.use-case'

import { IsApproveOrReject } from '@adapters/controllers/reviews/dto/update-status-review.dto'
import { ReviewController } from '@adapters/controllers/reviews/reviews.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { Review } from '@infrastructure/databases/postgressql/entities/reviews.entity'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { AppointmentRepository } from '@infrastructure/databases/postgressql/repositories/appointment.repository'
import { ClientRepository } from '@infrastructure/databases/postgressql/repositories/client.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { ReviewRepository } from '@infrastructure/databases/postgressql/repositories/review.repository'
import { ServiceRepository } from '@infrastructure/databases/postgressql/repositories/service.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Client,
      Appointment,
      User,
      Provider,
      Service,
    ]),
    EnvironmentConfigModule,
  ],
  controllers: [ReviewController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientRepository,
    },
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewRepository,
    },
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    CreateReviewUseCase,
    CaslAbilityFactory,
    UpdateReviewUseCase,
    IsApproveOrReject,
    UdpateStatusReviewUseCase,
    GetListReviewUseCase,
    GetDetailReviewUseCase,
  ],
})
export class ReviewModule {}
