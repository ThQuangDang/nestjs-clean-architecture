import {
  RefundRequestEntity,
  RefundStatusEnum,
} from '@domain/entities/refund_request.entity'

export const REFUND_REQUEST_REPOSITORY = 'REFUND_REQUEST_REPOSITORY_INTERFACE'

export interface ISearchRefundRequestParams {
  invoiceId?: number
  clientId?: number
  search?: string
  refundStatus?: RefundStatusEnum
  inDate?: Date
  sortBy?: 'createdAt' | 'id'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

export interface IRefundRequestRepository {
  createRefundRequest(
    data: Partial<RefundRequestEntity>,
  ): Promise<RefundRequestEntity>
  findLastestByInvoiceId(invoiceId: number): Promise<RefundRequestEntity | null>
  countRetryByInvoiceAndClient(
    invoiceId: number,
    clientId: number,
  ): Promise<number>
  updateRefundRequestStatus(
    id: number,
    status: RefundStatusEnum,
    userId: number,
    rejectReason?: string,
  ): Promise<boolean>
  findById(id: number): Promise<RefundRequestEntity | null>
  findRefundRequest(
    params: ISearchRefundRequestParams,
  ): Promise<RefundRequestEntity[]>
}
