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

import { CreateServiceUseCase } from '@use-cases/services/create-service.use-case'
import { GetDetailServiceUseCase } from '@use-cases/services/get-detail-service.use-case'
import { GetListServiceUseCase } from '@use-cases/services/get-list-service.use-case'
import { UpdateServiceUseCase } from '@use-cases/services/update-service.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { CreateServiceDto } from './dto/create-service.dto'
import { GetListServiceDto } from './dto/get-list-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'
import { CreateServicePresenter } from './presenter/create-service.presenter'
import { GetDetailServicePresenter } from './presenter/get-detail-service.presenter'
import { GetListServicePresenter } from './presenter/get-list-service.presenter'
import { UpdateServicePresenter } from './presenter/update-service.presenter'

@Controller('services')
@ApiTags('services')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class ServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly getDetailServiceUseCase: GetDetailServiceUseCase,
    private readonly getListServiceUseCase: GetListServiceUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateServiceDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Service),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create service',
    description: 'Create a service',
  })
  @ApiExtraModels(CreateServicePresenter)
  @ApiCreatedResponseType(CreateServicePresenter, false)
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.createServiceUseCase.execute({
      userId: userId,
      ...createServiceDto,
    })

    return new CreateServicePresenter(result)
  }

  @Patch(':id')
  @ApiBody({ type: UpdateServiceDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, Service),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update service',
    description: 'Update a service',
  })
  @ApiExtraModels(UpdateServicePresenter)
  @ApiCreatedResponseType(UpdateServicePresenter, false)
  async updateService(
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.updateServiceUseCase.execute(
      {
        id: id,
        userId: userId,
      },
      updateServiceDto,
    )

    return new UpdateServicePresenter(result)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get service detail',
    description: 'Get detail a service',
  })
  @ApiExtraModels(GetDetailServicePresenter)
  @ApiCreatedResponseType(GetDetailServicePresenter, false)
  async detailService(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.getDetailServiceUseCase.execute({
      id: id,
      userId: userId,
    })

    return new GetDetailServicePresenter(result)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list services',
    description: 'Get list services',
  })
  @ApiExtraModels(GetListServicePresenter)
  @ApiCreatedResponseType(GetListServicePresenter, false)
  async listService(
    @CurrentUser('id') userId: number,
    @Query() querySerchParam: GetListServiceDto,
  ) {
    const services = await this.getListServiceUseCase.execute({
      ...querySerchParam,
      userId,
    })

    return services.map((service) => new GetListServicePresenter(service))
  }
}
