export const GMAIL_SERVICE = 'GMAIL_SERVICE_INTERFACE'

export interface IGmailUserPayload {
  userId?: number
  email: string
  username: string
  password: string
  role: string
}

export interface IGmailAppointmentProviderPayload {
  userId?: number
  providerEmail: string
  providerName: string
  clientEmail: string
  clientName: string
  serviceName: string
  appointmentTime: Date
  cancelReason?: string
  cancelBy?: string
}

export interface IGmailMonthlyRevenuePayload {
  userId?: number
  providerName: string
  providerEmail: string
  month: Date
  totalRevenue: number
  totalPayment: number
}

export interface IGmailService {
  sendMailToUser(user: IGmailUserPayload): Promise<void>
  sendMailRejectToUser(
    user: Pick<IGmailUserPayload, 'email' | 'username'>,
  ): Promise<void>
  sendMailApprovToUser(
    user: Pick<IGmailUserPayload, 'email' | 'username'>,
  ): Promise<void>
  sendAppointmentNotificationToProvider(
    payload: IGmailAppointmentProviderPayload,
  ): Promise<void>
  sendMailProviderOrClientCancel(
    payload: IGmailAppointmentProviderPayload,
  ): Promise<void>
  sendMailProviderConfirmToClient(
    payload: IGmailAppointmentProviderPayload,
  ): Promise<void>
  sendMailMonthlyRevenueReportToProvider(
    payload: IGmailMonthlyRevenuePayload,
  ): Promise<void>
  sendInvoiceCreatedAndReminderMailToClient(payload: {
    userId?: number
    clientName: string
    clientEmail: string
    invoiceId: number
    appointmentDate: Date
    amount: number
    dueDate?: Date
  }): Promise<void>
  sendInvoiceCanceledMailToClient(payload: {
    userId?: number
    clientName: string
    clientEmail: string
    invoiceId: number
    appointmentDate: Date
  }): Promise<void>
  sendRefundApprovedNotification(payload: {
    userId?: number
    clientEmail: string
    clientName: string
    refundRequestId: number
    refundReason: string
  }): Promise<void>
  sendRefundRejectedNotification(payload: {
    userId?: number
    clientEmail: string
    clientName: string
    refundRequestId: number
    refundReason: string
    rejectReason?: string
  }): Promise<void>
  sendAppointmentTimeChangeMailToProvider(payload: {
    userId?: number
    providerName: string
    providerEmail: string
    clientName: string
    newAppointmentTime: Date
    appointmentId: number
  }): Promise<void>
}
