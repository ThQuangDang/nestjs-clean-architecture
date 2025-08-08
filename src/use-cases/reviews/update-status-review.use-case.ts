import { Inject, Injectable } from '@nestjs/common'

import { ReviewEntity, ReviewStatusEnum } from '@domain/entities/reviews.entity'
import { ServiceEntity } from '@domain/entities/services.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '@domain/repositories/review.repository.interface'
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class UdpateStatusReviewUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(
    params: { id: number; userId: number },
    payload: { status: ReviewStatusEnum },
  ) {
    await this.checkUser(params.userId)

    const review = await this.existingReview(params.id)

    const service = await this.checkService(review.serviceId)

    await this.avgRatingService(review.status, payload.status, review, service)

    return await this.reviewRepository.updateReview(
      {
        id: review.id,
      },
      { status: payload.status },
    )
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }
  }

  private async existingReview(reviewId: number) {
    const review = await this.reviewRepository.getReviewById(reviewId)

    if (!review) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Review not found',
      })
    }

    return review
  }

  private async avgRatingService(
    currentStatus: ReviewStatusEnum,
    nextStatus: ReviewStatusEnum,
    review: ReviewEntity,
    service: ServiceEntity,
  ) {
    if (currentStatus === nextStatus) {
      throw this.exceptionsService.badRequestException({
        type: 'ReviewAlreadyExists',
        message: `This review has been evaluated by you with currentStatus: ${currentStatus}`,
      })
    }

    const count = await this.reviewRepository.approvedReviewCount(service.id)

    let avgRating: number = 0

    if (nextStatus === ReviewStatusEnum.APPROVED) {
      avgRating = parseFloat(
        (
          (Number(service.rating) * count + Number(review.rating)) /
          (count + 1)
        ).toFixed(1),
      )
    } else if (nextStatus == ReviewStatusEnum.REJECTED) {
      if (count > 1) {
        avgRating = parseFloat(
          (
            (Number(service.rating) * count - Number(review.rating)) /
            (count - 1)
          ).toFixed(1),
        )
      } else {
        avgRating = 0
      }
    }

    const upService = await this.serviceRepository.updateService(
      {
        id: service.id,
        providerId: review.providerId,
      },
      { rating: avgRating },
    )

    if (!upService) {
      throw this.exceptionsService.badRequestException({
        type: 'UpdateFailed',
        message: 'Failed to update service rating',
      })
    }
  }

  private async checkService(serviceId: number) {
    const service = await this.serviceRepository.getServiceById(serviceId)

    if (!service) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Service not found',
      })
    }

    return service
  }
}
