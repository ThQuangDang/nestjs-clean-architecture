import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'

import { Queue } from 'bull'
import * as nodemailer from 'nodemailer'

import {
  IGmailAppointmentProviderPayload,
  IGmailMonthlyRevenuePayload,
  IGmailService,
  IGmailUserPayload,
} from '@domain/services/gmail.interface'

import { EnvironmentConfigService } from '@infrastructure/config/environment/environment-config.service'

@Injectable()
export class GmailSevice implements IGmailService {
  constructor(
    @InjectQueue('emailQueue')
    private readonly emailQueue: Queue,
    private readonly environmentConfigService: EnvironmentConfigService,
  ) {}
  private async addEmailtoQueue(
    email: string,
    subject: string,
    text: string,
    userId?: number,
  ): Promise<void> {
    await this.emailQueue.add(
      {
        email,
        subject,
        text,
        userId,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    )
  }

  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: this.environmentConfigService.getSmtpSystemGmail(),
      pass: this.environmentConfigService.getSmtpSystemPass(),
    },
  })

  async sendMail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: this.environmentConfigService.getSmtpSystemGmail(),
      to,
      subject,
      text,
    })
  }

  async sendMailToUser(user: IGmailUserPayload) {
    const { username, email, userId } = user
    const subject = 'Account Created Successfully'
    const text = `Hello ${username},
    \n\nYour account has been successfully created.
    \n\nUsername: ${username}
    \nPassword: ${user.password}
    \nRole: ${user.role}
    \n\nYou can now log in with the provided username and email. After logging in, please change your password.`
    await this.addEmailtoQueue(email, subject, text, userId)
  }

  async sendMailRejectToUser(
    user: Pick<IGmailUserPayload, 'email' | 'username'>,
  ) {
    const { username, email } = user
    const subject = 'Account Rejected By Admin'
    const text = `Hello ${username},
    \n\nWe regret to inform you that your account registration has been rejected by the administrator.
    \n\nIf you believe this was a mistake, please contact support for further assistance.`
    await this.addEmailtoQueue(email, subject, text)
  }

  async sendMailApprovToUser(
    user: Pick<IGmailUserPayload, 'email' | 'username'>,
  ) {
    const { username, email } = user
    const subject = 'Account Approved By Admin'
    const text = `Hello ${username},
    \n\nWe are pleased to inform you that your account registration has been approved by the administrator.
    \n\nYou can now log in and start using the system.`
    await this.addEmailtoQueue(email, subject, text)
  }

  async sendAppointmentNotificationToProvider(
    payload: IGmailAppointmentProviderPayload,
  ) {
    const {
      userId,
      providerEmail,
      providerName,
      clientName,
      serviceName,
      appointmentTime,
    } = payload

    const subject = '📅 You have a new appointment from a client'
    const text = `Hello ${providerName},

    You have received a new appointment from client *${clientName}*.

    Service: ${serviceName}  
    Appointment Time: ${appointmentTime.toLocaleString('vi-VN')}

    Please log in to the system to confirm this appointment.`

    await this.addEmailtoQueue(providerEmail, subject, text, userId)
  }

  async sendMailProviderConfirmToClient(
    payload: IGmailAppointmentProviderPayload,
  ): Promise<void> {
    const {
      userId,
      providerName,
      clientEmail,
      clientName,
      serviceName,
      appointmentTime,
    } = payload

    const subject = '✅ Your Appointment Confirmed'
    const text = `Hello ${clientName},

    Your appointment has been confirmed by provider *${providerName}*.

    Service: ${serviceName}
    Appointment Time: ${appointmentTime.toLocaleString('vi-VN')}

    Thank you for using our services.`

    await this.addEmailtoQueue(clientEmail, subject, text, userId)
  }

  async sendMailProviderOrClientCancel(
    payload: IGmailAppointmentProviderPayload,
  ): Promise<void> {
    const {
      userId,
      providerEmail,
      providerName,
      clientEmail,
      clientName,
      serviceName,
      appointmentTime,
      cancelReason,
      cancelBy,
    } = payload

    let toEmail: string
    let subject: string
    let text: string

    const formattedAppointmentTime = appointmentTime.toLocaleString('vi-VN')

    if (cancelBy === 'Client') {
      toEmail = providerEmail
      subject = `❌ Appointment Cancelled by Client: ${clientName}`
      text = `Hello ${providerName},

      An appointment with client *${clientName}* has been cancelled by the client.

      Service: ${serviceName}
      Appointment Time: ${formattedAppointmentTime}`

      if (cancelReason) {
        text += `\n\nReason canceled appointment by client: ${cancelReason}`
      }

      await this.addEmailtoQueue(toEmail, subject, text, userId)
    } else if (cancelBy === 'Provider') {
      toEmail = clientEmail
      subject = `❌ Appointment Cancelled by Provider: ${providerName}`
      text = `Hello ${clientName},

      Your appointment with provider *${providerName}* has been cancelled by the provider.

      Service: ${serviceName}
      Appointment Time: ${formattedAppointmentTime}`

      if (cancelReason) {
        text += `\n\nReason canceled appointment by provider: ${cancelReason}`
      }

      await this.addEmailtoQueue(toEmail, subject, text, userId)
    }
  }

  async sendMailMonthlyRevenueReportToProvider(
    payload: IGmailMonthlyRevenuePayload,
  ) {
    const {
      userId,
      providerName,
      providerEmail,
      month,
      totalRevenue,
      totalPayment,
    } = payload

    const formattedMonth = month.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })

    const subject = `📊 Monthly Revenue Report - ${formattedMonth} - ${providerName}`

    const text = `Hello ${providerName},
  
  Here is your revenue report for ${formattedMonth}:
  
  - Total completed or partial refunded payment: ${totalPayment}
  - Total revenue: ${totalRevenue.toLocaleString('en-US')} USD
  
  Thank you for being a used in our system.`
    await this.addEmailtoQueue(providerEmail, subject, text, userId)
  }

  async sendInvoiceCreatedAndReminderMailToClient(payload: {
    userId: number
    clientName: string
    clientEmail: string
    invoiceId: number
    appointmentDate: Date
    amount: number
    dueDate?: Date
  }) {
    const {
      userId,
      clientName,
      clientEmail,
      invoiceId,
      appointmentDate,
      amount,
      dueDate,
    } = payload

    const formattedAppointmentDate = appointmentDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const formattedDeadline = dueDate?.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const subject = `🧾 Invoice #${invoiceId} Created - Please Pay Within 24 Hours`

    const text = `Hello ${clientName},

Your invoice #${invoiceId} has been created for the appointment on ${formattedAppointmentDate}.

The total amount due is $${amount.toFixed(2)} USD.

Please complete your payment by ${formattedDeadline} to confirm your appointment.

If payment is not received within 24 hours, your invoice and appointment will be automatically canceled.

Thank you for choosing our service.`

    await this.addEmailtoQueue(clientEmail, subject, text, userId)
  }

  async sendInvoiceCanceledMailToClient(payload: {
    userId: number
    clientName: string
    clientEmail: string
    invoiceId: number
    appointmentDate: Date
  }) {
    const { userId, clientName, clientEmail, invoiceId, appointmentDate } =
      payload

    const formattedAppointmentDate = appointmentDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const subject = `❌ Invoice #${invoiceId} and Appointment Canceled`

    const text = `Hello ${clientName},

We regret to inform you that your invoice #${invoiceId} and the appointment scheduled on ${formattedAppointmentDate} have been canceled due to non-payment.

If you wish to reschedule or have any questions, please contact us.

Thank you for your understanding.`

    await this.addEmailtoQueue(clientEmail, subject, text, userId)
  }

  async sendRefundApprovedNotification(payload: {
    userId: number
    clientEmail: string
    clientName: string
    refundRequestId: number
    refundReason: string
  }) {
    const { userId, clientEmail, clientName, refundRequestId, refundReason } =
      payload

    const subject = `✅ Refund Request Approved (#${refundRequestId})`

    const text = `Hello ${clientName},

Good news! Your refund request with ID #${refundRequestId} has been approved by our team.

Refund Reason: ${refundReason}

The refund will be processed shortly. If you have any questions, please contact our support team.

Thank you for your patience and understanding.`

    await this.addEmailtoQueue(clientEmail, subject, text, userId)
  }

  async sendRefundRejectedNotification(payload: {
    userId: number
    clientEmail: string
    clientName: string
    refundRequestId: number
    refundReason: string
    rejectReason?: string
  }) {
    const {
      userId,
      clientEmail,
      clientName,
      refundRequestId,
      refundReason,
      rejectReason,
    } = payload

    const subject = `❌ Refund Request Rejected (#${refundRequestId})`

    const text = `Hello ${clientName},

We regret to inform you that your refund request with ID #${refundRequestId} has been rejected.

Refund Reason: ${refundReason}
Reason for Rejection: ${rejectReason}

If you have any questions or would like to discuss this further, please contact our support team.

Thank you for your understanding.`

    await this.addEmailtoQueue(clientEmail, subject, text, userId)
  }

  async sendAppointmentTimeChangeMailToProvider(payload: {
    userId: number
    providerName: string
    providerEmail: string
    clientName: string
    newAppointmentTime: Date
    appointmentId: number
  }) {
    const {
      userId,
      providerName,
      providerEmail,
      clientName,
      newAppointmentTime,
      appointmentId,
    } = payload

    const formattedNewAppointmentTime = newAppointmentTime.toLocaleString(
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    )

    const subject = `⚠️ Appointment Time Change for Appointment #${appointmentId}`

    const text = `Hello ${providerName},

We would like to inform you that the client ${clientName} has changed the appointment time for appointment #${appointmentId}. The new appointment time is scheduled for ${formattedNewAppointmentTime}.

Please log into the system to review and confirm the new appointment time. If you have any questions or concerns, please feel free to reach out.

Thank you for your prompt attention to this matter.`

    await this.addEmailtoQueue(providerEmail, subject, text, userId)
  }
}
