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

import { CreateReviewUseCase } from '@use-cases/reviews/create-review.use-case'
import { GetDetailReviewUseCase } from '@use-cases/reviews/get-detail-review.use-case'
import { GetListReviewUseCase } from '@use-cases/reviews/get-list-review.use-case'
import { UpdateReviewUseCase } from '@use-cases/reviews/update-review.use-case'
import { UdpateStatusReviewUseCase } from '@use-cases/reviews/update-status-review.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Review } from '@infrastructure/databases/postgressql/entities/reviews.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { CreateReviewDto } from './dto/create-review.dto'
import { GetListReviewDto } from './dto/get-list-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { UpdateStatusReivewDto } from './dto/update-status-review.dto'
import { CreateReviewPresenter } from './presenter/create-review.presenter'
import { GetDetailReviewPresenter } from './presenter/get-detail-review.presenter'
import { GetListReviewPresenter } from './presenter/get-list-review.presenter'
import { UpdateReviewPresenter } from './presenter/update-review.presenter'

@Controller('reviews')
@ApiTags('reviews')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly updateStatusReviewUseCase: UdpateStatusReviewUseCase,
    private readonly getListReviewUseCase: GetListReviewUseCase,
    private readonly getDetailReviewUseCase: GetDetailReviewUseCase,
  ) {}

  @Post(':id')
  @ApiBody({ type: CreateReviewDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Review),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create review',
    description: 'Create a review',
  })
  @ApiExtraModels(CreateReviewPresenter)
  @ApiCreatedResponseType(CreateReviewPresenter, false)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const review = await this.createReviewUseCase.execute(createReviewDto, {
      appointmentId: id,
      userId,
    })

    return new CreateReviewPresenter(review)
  }

  @Patch(':id')
  @ApiBody({ type: UpdateReviewDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, Review),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update review',
    description: 'Update a review',
  })
  @ApiExtraModels(UpdateReviewPresenter)
  @ApiCreatedResponseType(UpdateReviewPresenter, false)
  async updateReview(
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const review = await this.updateReviewUseCase.execute(
      {
        id: id,
        userId: userId,
      },
      updateReviewDto,
    )

    return new UpdateReviewPresenter(review)
  }

  @Patch(':id/status')
  @ApiBody({ type: UpdateStatusReivewDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.UpdateStatus, Review),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update review status',
    description: 'Update a review status',
  })
  @ApiExtraModels(UpdateReviewPresenter)
  @ApiCreatedResponseType(UpdateReviewPresenter, false)
  async updateReviewStatus(
    @Body() updateReviewStatusDto: UpdateStatusReivewDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const review = await this.updateStatusReviewUseCase.execute(
      {
        id: id,
        userId: userId,
      },
      updateReviewStatusDto,
    )

    return new UpdateReviewPresenter(review)
  }

  @Get()
  @ApiBody({ type: GetListReviewDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list review',
    description: 'Get list review',
  })
  @ApiExtraModels(GetListReviewPresenter)
  @ApiCreatedResponseType(GetListReviewPresenter, false)
  async listReview(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListReviewDto,
  ) {
    const reviews = await this.getListReviewUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return reviews.map((review) => new GetListReviewPresenter(review))
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get review detail',
    description: 'Get detail a review',
  })
  @ApiExtraModels(GetDetailReviewPresenter)
  @ApiCreatedResponseType(GetDetailReviewPresenter, false)
  async detailReview(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const review = await this.getDetailReviewUseCase.execute({
      id,
      userId: userId,
    })

    return new GetDetailReviewPresenter(review)
  }
}
