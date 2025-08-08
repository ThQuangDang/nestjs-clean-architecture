import { Inject, Injectable } from '@nestjs/common'

import { ReviewEntity, ReviewStatusEnum } from '@domain/entities/reviews.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '@domain/repositories/review.repository.interface'
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'

@Injectable()
export class UpdateReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(
    params: { id: number; userId: number },
    payload: Partial<ReviewEntity>,
  ) {
    const client = await this.checkClient(params.userId)

    const review = await this.existingReview(params.id, client.id)

    const service = await this.checkService(review.serviceId)

    if (review.status === ReviewStatusEnum.APPROVED) {
      const count = await this.reviewRepository.approvedReviewCount(service.id)

      let avgRating: number = 0

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

    return await this.reviewRepository.updateReview(
      {
        id: review.id,
      },
      {
        ...payload,
        status: ReviewStatusEnum.PENDING,
      },
    )
  }

  private async checkClient(userId: number) {
    const client = await this.clientRepository.findClientByUserId(userId)

    if (!client) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async existingReview(reviewId: number, clientId: number) {
    const review = await this.reviewRepository.findOnReview(reviewId, clientId)

    if (!review) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Review not found',
      })
    }
    return review
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
