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

import { GetListRequestRefundUseCase } from '@use-cases/refund-requests/get-list-request-refund.use-case'
import { RequestRefundByAdminUseCase } from '@use-cases/refund-requests/request-refund-by-admin.use-case'
import { RequestRefundByClientUseCase } from '@use-cases/refund-requests/request-refund-by-client.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { RefundRequest } from '@infrastructure/databases/postgressql/entities/refund_request.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { GetListRequestRefundDto } from './dto/get-list-request-refund.dto'
import { RequestRefundByAdminDto } from './dto/request-refund-by-admin.dto'
import { RequestRefundByClientDto } from './dto/request-refund-by-client.dto'
import { GetListRequestRefundPresenter } from './presenter/get-list-request-refund.presenter'
import { RequestRefundByAdminPresenter } from './presenter/request-refund-by-admin.presenter'
import { RequestRefundByClientPresenter } from './presenter/request-refund-by-client.presenter'

@Controller('refunds')
@ApiTags('refunds')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class RefundRequestController {
  constructor(
    private readonly requestRefundByClientUseCase: RequestRefundByClientUseCase,
    private readonly requestRefundByAdminUseCase: RequestRefundByAdminUseCase,
    private readonly getListRequestRefundUseCase: GetListRequestRefundUseCase,
  ) {}

  @Post(':id')
  @ApiBody({ type: RequestRefundByClientDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, RefundRequest),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create request refund',
    description: 'Create a request refund',
  })
  @ApiExtraModels(RequestRefundByClientPresenter)
  @ApiCreatedResponseType(RequestRefundByClientPresenter, false)
  async createRequestRefund(
    @Body() requestRefundByClientDto: RequestRefundByClientDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const refund = await this.requestRefundByClientUseCase.execute(
      {
        userId,
        invoiceId: id,
      },
      requestRefundByClientDto,
    )

    return new RequestRefundByClientPresenter(refund)
  }

  @Patch(':id/status')
  @ApiBody({ type: RequestRefundByAdminDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, RefundRequest),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update refund status by admin',
    description: 'Update a refund status by admin',
  })
  @ApiExtraModels(RequestRefundByAdminPresenter)
  @ApiCreatedResponseType(RequestRefundByAdminPresenter, false)
  async updateRequestRefund(
    @Body() requestRefundByAdminDto: RequestRefundByAdminDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const refund = await this.requestRefundByAdminUseCase.execute(
      {
        userId,
        id,
      },
      requestRefundByAdminDto,
    )

    return new RequestRefundByAdminPresenter(refund)
  }

  @Get()
  @ApiBody({ type: GetListRequestRefundDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Read, RefundRequest),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list request refunds',
    description: 'Get list request refunds',
  })
  @ApiExtraModels(GetListRequestRefundPresenter)
  @ApiCreatedResponseType(GetListRequestRefundPresenter, false)
  async listRequestRefund(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListRequestRefundDto,
  ) {
    const refunds = await this.getListRequestRefundUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return refunds.map((refund) => new GetListRequestRefundPresenter(refund))
  }
}
