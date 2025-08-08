export const REDIS_SERVICE = 'REDIS_SERVICE_INTERFACE'

export interface IRedisService {
  getRatingData(
    serviceId: number,
  ): Promise<{ totalRating: number; totalReview: number; avgRating: number }>
  updateRatingData(serviceId: number, rating: number): Promise<void>
  removeRatingData(serviceId: number, rating: number): Promise<void>
}
