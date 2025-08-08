import Stripe from 'stripe'

export const STRIPE_SERVICE = 'STRIPE_SERVICE_INTERFACE'

export interface IStripeService {
  createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.PaymentIntent>
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event
  getPublishableKey(): string
  cancelPaymentIntent(id: string): Promise<Stripe.PaymentIntent>
  createRefund(params: Stripe.RefundCreateParams): Promise<Stripe.Refund>
  retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent>
  getWebhookSecret(): string
}
