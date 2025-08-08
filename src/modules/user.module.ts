import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { CLIENT_REPOSITORY } from '@domain/repositories/client.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'
import { BCRYPT_SERVICE } from '@domain/services/bcrypt.interface'
import { GMAIL_SERVICE } from '@domain/services/gmail.interface'

import { ChangePasswordUseCase } from '@use-cases/user/change-password.use-case'
import { CreateAccountUseCase } from '@use-cases/user/create-account.use-case'
import { CreateClientUseCase } from '@use-cases/user/create-client.use-case'
import { CreateProviderUseCase } from '@use-cases/user/create-provider.use-case'
import { GetListUserUseCase } from '@use-cases/user/get-list-user.use-case'
import { UpdateAccountStatusUseCase } from '@use-cases/user/update-account-status.use-case'
import { UpdateProviderUseCase } from '@use-cases/user/update-provider.use-case'

import { UsersController } from '@adapters/controllers/users/users.controllers'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { ClientRepository } from '@infrastructure/databases/postgressql/repositories/client.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { BcryptService } from '@infrastructure/services/bcrypt/bcrypt.service'
import { GmailModule } from '@infrastructure/services/gmail/gmail.module'
import { GmailSevice } from '@infrastructure/services/gmail/gmail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Provider, Client]),
    EnvironmentConfigModule,
    GmailModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientRepository,
    },
    {
      provide: GMAIL_SERVICE,
      useClass: GmailSevice,
    },
    {
      provide: BCRYPT_SERVICE,
      useClass: BcryptService,
    },
    CreateAccountUseCase,
    ChangePasswordUseCase,
    UpdateProviderUseCase,
    UpdateAccountStatusUseCase,
    GetListUserUseCase,
    CreateProviderUseCase,
    CreateClientUseCase,
    CaslAbilityFactory,
  ],
})
export class UserModule {}
