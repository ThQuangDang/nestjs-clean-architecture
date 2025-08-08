import { Inject, Injectable } from '@nestjs/common'

import Stripe from 'stripe'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import { IStripeService } from '@domain/services/stripe.interface'

import { EnvironmentConfigService } from '@infrastructure/config/environment/environment-config.service'
import { LoggerService } from '@infrastructure/logger/logger.service'

@Injectable()
export class StripeService implements IStripeService {
  private stripe: Stripe
  private publishableKey: string
  private webhookSecret: string

  constructor(
    private readonly environmentConfigService: EnvironmentConfigService,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    private readonly logger: LoggerService,
  ) {
    const secretKey = this.environmentConfigService.getStripeSecretKey()
    this.publishableKey =
      this.environmentConfigService.getStripePublishableKey()
    this.webhookSecret = this.environmentConfigService.getStripeWebhookSecret()

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil',
    })
  }

  async createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create(params)
      return paymentIntent
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeError) {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Payment Gateway Error',
          message:
            error.message || 'Có lỗi xảy ra khi giao tiếp với cổng thanh toán.',
        })
      } else {
        this.logger.error('Unexpected error creating Payment Intent:', {
          error,
        })
        throw this.exceptionsService.internalServerErrorException({
          type: 'Unexpected Error',
          message: 'Có lỗi không xác định xảy ra.',
        })
      }
    }
  }

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret?: string,
  ): Stripe.Event {
    const webhookSecretToUse = secret || this.webhookSecret
    if (!webhookSecretToUse) {
      throw new Error('Stripe Webhook Secret is not configured.')
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecretToUse,
      )
      return event
    } catch (error: unknown) {
      this.logger.warn(
        'StripeService',
        'Webhook signature verification failed.',
      )
      throw error
    }
  }

  getPublishableKey(): string {
    return this.publishableKey
  }

  async cancelPaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(id)
      return paymentIntent
    } catch (error: unknown) {
      this.logger.error(`Error canceling Stripe Payment Intent ${id}:`, {
        error,
      })
      throw error
    }
  }

  async createRefund(
    params: Stripe.RefundCreateParams,
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create(params)
      return refund
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeError) {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Payment Gateway Error',
          message: error.message || 'Có lỗi xảy ra khi yêu cầu hoàn tiền.',
        })
      }
      throw this.exceptionsService.internalServerErrorException({
        type: 'Unexpected Error',
        message: 'Có lỗi không xác định xảy ra khi yêu cầu hoàn tiền.',
      })
    }
  }

  getWebhookSecret(): string {
    return this.webhookSecret
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(id)
      return paymentIntent
    } catch (error: unknown) {
      this.logger.error(`Error canceling Stripe Payment Intent ${id}:`, {
        error,
      })
      throw error
    }
  }
}
