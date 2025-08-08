import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { ChangePasswordUseCase } from '@use-cases/user/change-password.use-case'
import { CreateAccountUseCase } from '@use-cases/user/create-account.use-case'
import { CreateClientUseCase } from '@use-cases/user/create-client.use-case'
import { CreateProviderUseCase } from '@use-cases/user/create-provider.use-case'
import { GetListUserUseCase } from '@use-cases/user/get-list-user.use-case'
import { UpdateAccountStatusUseCase } from '@use-cases/user/update-account-status.use-case'
import { UpdateProviderUseCase } from '@use-cases/user/update-provider.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateAccountDto } from './dto/create-account.dto'
import { CreateClientDto } from './dto/create-client.dto'
import { CreateProviderDto } from './dto/create-provider.dto'
import { GetListUserDto } from './dto/get-list-user.dto'
import { UpdateAccountStatusDto } from './dto/update-account-status.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { ChangePasswordPresenter } from './presenters/change-password.presenter'
import { CreateAccountPresenter } from './presenters/create-account.presenters'
import { CreateClientPresenter } from './presenters/create-client.presenter'
import { CreateProviderPresenter } from './presenters/create-provider.presenter'
import { GetListUserPresenter } from './presenters/get-list-user.presenter'
import { UPdateAccountStatusPresenter } from './presenters/update-account-status.presenter'
import { UpdateProviderPresenter } from './presenters/update-provider.presenter'

@Controller('users')
@ApiTags('users')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class UsersController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updateProviderUseCase: UpdateProviderUseCase,
    private readonly updateAccountStatusUseCase: UpdateAccountStatusUseCase,
    private readonly getListUserUseCase: GetListUserUseCase,
    private readonly createProviderUseCase: CreateProviderUseCase,
    private readonly createClientUseCase: CreateClientUseCase,
  ) {}

  @Post('account')
  @ApiBody({ type: CreateAccountDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) => ability.can(ActionEnum.Create, User))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create account',
    description: 'Create account by admin',
  })
  @ApiExtraModels(CreateAccountPresenter)
  @ApiResponseType(CreateAccountPresenter, false)
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    const user = await this.createAccountUseCase.execute(createAccountDto)
    return new CreateAccountPresenter(user)
  }

  @Post('password/change')
  @ApiBody({ type: ChangePasswordDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change password',
    description: '',
  })
  @ApiExtraModels(ChangePasswordPresenter)
  @ApiResponseType(ChangePasswordPresenter, false)
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const updatePassword = await this.changePasswordUseCase.execute({
      userId,
      ...changePasswordDto,
    })

    return new ChangePasswordPresenter(updatePassword)
  }

  @Patch(':id/provider')
  @ApiBody({ type: UpdateProviderDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, Provider),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update profile provider',
    description: 'Provider updates profile',
  })
  @ApiResponseType(UpdateProviderPresenter, false)
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    const provider = await this.updateProviderUseCase.execute(
      {
        id: id,
        userId: userId,
      },
      updateProviderDto,
    )

    return new UpdateProviderPresenter(provider)
  }

  @Patch(':id')
  @ApiBody({ type: UpdateAccountStatusDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) => ability.can(ActionEnum.Update, User))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account status',
    description: 'Update account status by admin',
  })
  @ApiExtraModels(UPdateAccountStatusPresenter)
  @ApiResponseType(UPdateAccountStatusPresenter, false)
  async updateAccountStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountStatusDto: UpdateAccountStatusDto,
  ) {
    const result = await this.updateAccountStatusUseCase.execute(
      { userId: id },
      updateAccountStatusDto,
    )
    return new UPdateAccountStatusPresenter(result)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list users',
    description: 'Get list users',
  })
  @ApiExtraModels(GetListUserPresenter)
  @ApiResponseType(GetListUserPresenter, false)
  async listUser(
    @CurrentUser('id') userId: number,
    @Query() querySerchParam: GetListUserDto,
  ) {
    const users = await this.getListUserUseCase.execute({
      ...querySerchParam,
      id: userId,
    })

    return users.map((user) => new GetListUserPresenter(user))
  }

  @Post('provider')
  @ApiBody({ type: CreateProviderDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Provider),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create profile provider',
    description: 'Create profile provider',
  })
  @ApiExtraModels(CreateProviderPresenter)
  @ApiResponseType(CreateProviderPresenter, false)
  async createProvdier(
    @CurrentUser('id') userId: number,
    @Body() createProviderDto: CreateProviderDto,
  ) {
    const provider = await this.createProviderUseCase.execute(
      { userId },
      createProviderDto,
    )
    return new CreateProviderPresenter(provider)
  }

  @Post('client')
  @ApiBody({ type: CreateClientDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Client),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create profile client',
    description: 'Create profile client',
  })
  @ApiExtraModels(CreateClientPresenter)
  @ApiResponseType(CreateClientPresenter, false)
  async createClient(
    @CurrentUser('id') userId: number,
    @Body() createClientDto: CreateClientDto,
  ) {
    const client = await this.createClientUseCase.execute(
      { userId },
      createClientDto,
    )
    return new CreateClientPresenter(client)
  }
}
