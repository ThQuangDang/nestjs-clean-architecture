import { Process, Processor } from '@nestjs/bull'

import { Job } from 'bull'

import { ReviewAvgRatingService } from './review-avg-rating.service'

@Processor('reviewAvgRatingQueue')
export class ReviewAvgRatingProcessor {
  constructor(
    private readonly reviewAvgRatingService: ReviewAvgRatingService,
  ) {}

  @Process()
  async handleReviewAvgRating(
    job: Job<{
      serviceId: number
      rating: number
      providerId: number
      action: 'create' | 'reject'
    }>,
  ) {
    const { serviceId, rating, providerId, action } = job.data
    try {
      await this.reviewAvgRatingService.execute(
        serviceId,
        rating,
        providerId,
        action,
      )
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to caculate avg rating service: ${error.message}`,
        )
      } else {
        throw new Error(
          'An unknown error occurred while caculate avg rating service',
        )
      }
    }
  }
}
