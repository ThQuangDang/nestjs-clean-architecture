import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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

import { GetDetailRevenueUseCase } from '@use-cases/revenues/get-detail-revenue.use-case'
import { GetListRevenueUseCase } from '@use-cases/revenues/get-list-revenue.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Revenue } from '@infrastructure/databases/postgressql/entities/revenues.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { GetListRevenueDto } from './dto/get-list-revenue.dto'
import { GetDetailRevenuePresenter } from './presenter/get-detail-revenue.presenter'
import { GetListRevenuePresenter } from './presenter/get-list-revenue.presenter'

@Controller('revenues')
@ApiTags('revenues')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class RevenueController {
  constructor(
    private readonly getListRevenueUseCase: GetListRevenueUseCase,
    private readonly getDetailRevenueUseCase: GetDetailRevenueUseCase,
  ) {}

  @Get('')
  @ApiBody({ type: GetListRevenueDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Read, Revenue),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list revenues',
    description: 'Get list revenues',
  })
  @ApiExtraModels(GetListRevenuePresenter)
  @ApiCreatedResponseType(GetListRevenuePresenter, false)
  async listRevenue(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListRevenueDto,
  ) {
    const revenues = await this.getListRevenueUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return revenues.map((reven) => new GetListRevenuePresenter(reven))
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Read, Revenue),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get revenue detail',
    description: 'Get detail a revenue',
  })
  @ApiExtraModels(GetDetailRevenuePresenter)
  @ApiCreatedResponseType(GetDetailRevenuePresenter, false)
  async detailAppointment(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const revenue = await this.getDetailRevenueUseCase.execute({
      id,
      userId: userId,
    })

    return new GetDetailRevenuePresenter(revenue)
  }
}
