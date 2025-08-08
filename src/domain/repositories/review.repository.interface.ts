import { ReviewEntity, ReviewStatusEnum } from '@domain/entities/reviews.entity'

export const REVIEW_REPOSITORY = 'REVIEW_REPOSITORY_INTERFACE'

export interface ISearchReviewParam {
  status?: ReviewStatusEnum
  rating?: number
  search?: string
  sortBy?: 'createdAt' | 'rating'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
  providerId?: number
  serviceId?: number
  clientId?: number
  appointmentId?: number
  isClient?: boolean
  isProvider?: boolean
}

export interface IReviewRepository {
  createReview(review: Partial<ReviewEntity>): Promise<ReviewEntity>
  getReviewByAppointmentId(id: number): Promise<ReviewEntity | null>
  updateReview(
    params: {
      id: number
    },
    review: Partial<ReviewEntity>,
  ): Promise<boolean>
  findOnReview(id: number, clientId: number): Promise<ReviewEntity | null>
  getReviewById(id: number): Promise<ReviewEntity | null>
  findReviews(params: ISearchReviewParam): Promise<ReviewEntity[]>
  approvedReviewCount(serviceId: number): Promise<number>
}
