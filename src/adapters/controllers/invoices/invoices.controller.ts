import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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

import { CreateInvoiceUseCase } from '@use-cases/invoices/create-invoice.use-case'
import { GetDetailInvoiceUseCase } from '@use-cases/invoices/get-detail-invoice.use-case'
import { GetListInvoiceUseCase } from '@use-cases/invoices/get-list-invoice.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Invoice } from '@infrastructure/databases/postgressql/entities/invoices.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { GetListInvoiceDto } from './dto/get-list-invoice.dto'
import { CreateInvoicePresenter } from './presenter/create-invoice.presenter'
import { GetDetailInvoicePresenter } from './presenter/get-detail-invoice.presenter'
import { GetListInvoicePresenter } from './presenter/get-list-invoice.presenter'

@Controller('invoices')
@ApiTags('invoices')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class InvoiceController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getListInvoiceUseCase: GetListInvoiceUseCase,
    private readonly getDetailInvoiceUseCase: GetDetailInvoiceUseCase,
  ) {}

  @Post(':id')
  @ApiBody({ type: CreateInvoiceDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Invoice),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create invoice',
    description: 'Create a invoice',
  })
  @ApiExtraModels(CreateInvoicePresenter)
  @ApiCreatedResponseType(CreateInvoicePresenter, false)
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const invoice = await this.createInvoiceUseCase.execute(
      {
        userId,
        appointmentId: id,
      },
      createInvoiceDto,
    )
    return new CreateInvoicePresenter(invoice)
  }

  @Get()
  @ApiBody({ type: GetListInvoiceDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list invoices',
    description: 'Get list invoices',
  })
  @ApiExtraModels(GetListInvoicePresenter)
  @ApiCreatedResponseType(GetListInvoicePresenter, false)
  async listInvoice(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListInvoiceDto,
  ) {
    const invoices = await this.getListInvoiceUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return invoices.map((invoi) => new GetListInvoicePresenter(invoi))
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get invoice detail',
    description: 'Get detail a invoice',
  })
  @ApiExtraModels(GetDetailInvoicePresenter)
  @ApiCreatedResponseType(GetDetailInvoicePresenter, false)
  async detailInvoice(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const invoice = await this.getDetailInvoiceUseCase.execute({
      id,
      userId: userId,
    })

    return new GetDetailInvoicePresenter(invoice)
  }
}
