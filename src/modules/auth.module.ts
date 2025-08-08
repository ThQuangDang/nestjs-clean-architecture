import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'
import { BCRYPT_SERVICE } from '@domain/services/bcrypt.interface'
import { JWT_SERVICE } from '@domain/services/jwt.interface'

import { LoginUseCase } from '@use-cases/auth/login.use-case'
import { RefreshUseCase } from '@use-cases/auth/refresh.use-case'
import { RegisterUseCase } from '@use-cases/auth/register.use-case'

import { AuthController } from '@adapters/controllers/auth/auth.controller'
import { IsProviderOrClient } from '@adapters/controllers/auth/dto/register.dto'

import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { BcryptService } from '@infrastructure/services/bcrypt/bcrypt.service'
import { JwtModule } from '@infrastructure/services/jwt/jwt.module'
import { JwtService } from '@infrastructure/services/jwt/jwt.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EnvironmentConfigModule,
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    {
      provide: BCRYPT_SERVICE,
      useClass: BcryptService,
    },
    {
      provide: JWT_SERVICE,
      useClass: JwtService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    IsProviderOrClient,
  ],
})
export class AuthModule {}
