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

import { CreatePromotionUseCase } from '@use-cases/promotions/create-promotion.use-case'
import { GetDetailPromotionUseCase } from '@use-cases/promotions/get-detail-promotion.use-case'
import { GetListPromotionUseCase } from '@use-cases/promotions/get-list-promotion.use-case'
import { UpdatePromotionUseCase } from '@use-cases/promotions/update-promotion.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Promotion } from '@infrastructure/databases/postgressql/entities/promotions.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { CreatePromotionDto } from './dto/create-promotion.dto'
import { GetListPromotionDto } from './dto/get-list-promotion.dto'
import { UpdatePromotionDto } from './dto/update-promotion.dto'
import { CreatePromotionPresenter } from './presenter/create-promotion.presenter'
import { GetDetailPromotionPresenter } from './presenter/get-detail-promotion.presenter'
import { GetListPromotionPresenter } from './presenter/get-list-promotion.presenter'
import { UpdatePromotionPresenter } from './presenter/update-promotion.presenter'

@Controller('promotions')
@ApiTags('promotions')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class PromotionController {
  constructor(
    private readonly createPromotionUseCase: CreatePromotionUseCase,
    private readonly updatePromotionUseCase: UpdatePromotionUseCase,
    private readonly getDetailPromotionUseCase: GetDetailPromotionUseCase,
    private readonly getListPromotionUseCase: GetListPromotionUseCase,
  ) {}

  @Post('')
  @ApiBody({ type: CreatePromotionDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Promotion),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create review',
    description: 'Create a review',
  })
  @ApiExtraModels(CreatePromotionPresenter)
  @ApiCreatedResponseType(CreatePromotionPresenter, false)
  async createService(
    @Body() createPromotionDto: CreatePromotionDto,
    @CurrentUser('id') userId: number,
  ) {
    const promotion = await this.createPromotionUseCase.execute({
      userId: userId,
      ...createPromotionDto,
      serviceIds: createPromotionDto.serviceIds.map((s) => s.serviceId),
    })

    return new CreatePromotionPresenter({
      ...promotion,
      serviceIds: promotion.serviceIds,
    })
  }

  @Patch(':id')
  @ApiBody({ type: UpdatePromotionDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, Promotion),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update promotion',
    description: 'Update a promotion',
  })
  @ApiExtraModels(UpdatePromotionPresenter)
  @ApiCreatedResponseType(UpdatePromotionPresenter, false)
  async updateService(
    @Body() updatePromotionDto: UpdatePromotionDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.updatePromotionUseCase.execute(
      {
        id: id,
        userId: userId,
      },
      {
        ...updatePromotionDto,
        serviceIds: updatePromotionDto.serviceIds?.map((s) => s.serviceId),
      },
    )

    return new UpdatePromotionPresenter(result)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get promotion detail',
    description: 'Get detail a promotion',
  })
  @ApiExtraModels(GetDetailPromotionPresenter)
  @ApiCreatedResponseType(GetDetailPromotionPresenter, false)
  async detailPromotion(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.getDetailPromotionUseCase.execute({
      promotionId: id,
      userId: userId,
    })

    return new GetDetailPromotionPresenter(result)
  }

  @Get('')
  @ApiBody({ type: GetListPromotionDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list promotions',
    description: 'Get list promotions',
  })
  @ApiExtraModels(GetListPromotionPresenter)
  @ApiCreatedResponseType(GetListPromotionPresenter, false)
  async listPromotion(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListPromotionDto,
  ) {
    const promotions = await this.getListPromotionUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return promotions.map((promo) => new GetListPromotionPresenter(promo))
  }
}
