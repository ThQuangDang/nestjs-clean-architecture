import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
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

import { InitiatePaymentUseCase } from '@use-cases/payment/create-payment.use-case'
import { HandleStripeWebhookUseCase } from '@use-cases/payment/handle-webhook-stripe.use-case'
import { RefundPaymentUseCase } from '@use-cases/payment/refund-payment.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Payment } from '@infrastructure/databases/postgressql/entities/payments.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { RefundPaymentDto } from './dto/refund-payment.dto'
import { InitiatePaymentPresenter } from './presenter/create-payment.presenter'

@Controller('payments')
@ApiTags('payments')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class PaymentController {
  constructor(
    private readonly initiatePaymentUseCase: InitiatePaymentUseCase,
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
  ) {}

  @Post(':id/pay')
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Payment),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create payment',
    description: 'Create a payment',
  })
  @ApiExtraModels(InitiatePaymentPresenter)
  @ApiCreatedResponseType(InitiatePaymentPresenter, false)
  async createPayment(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const payment = await this.initiatePaymentUseCase.execute({
      userId,
      invoiceId: id,
    })

    return new InitiatePaymentPresenter(payment)
  }

  @Post('webhooks/stripe')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Stripe webhook handler',
    description:
      'Handles Stripe webhook events like payment_intent.succeeded, etc.',
  })
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as Request & { rawBody: Buffer }).rawBody
    await this.handleStripeWebhookUseCase.execute(rawBody, signature)
    return { recived: true }
  }

  @Post(':id/refund')
  @ApiBody({ type: RefundPaymentDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, Payment),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate refund for a payment',
    description:
      'Initiates the refund process for a completed payment transaction.',
  })
  async initiateRefund(
    @Body() refundPaymentDto: RefundPaymentDto,
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) paymentId: number,
  ) {
    const refundResult = await this.refundPaymentUseCase.execute(
      { paymentId: paymentId, userId },
      refundPaymentDto,
    )
    return refundResult
  }
}
