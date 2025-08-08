import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ReviewEntity, ReviewStatusEnum } from '@domain/entities/reviews.entity'
import {
  IReviewRepository,
  ISearchReviewParam,
} from '@domain/repositories/review.repository.interface'

import { Review } from '../entities/reviews.entity'

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async createReview(review: Partial<ReviewEntity>) {
    const newReview = this.reviewRepository.create(review)
    return await this.reviewRepository.save(newReview)
  }

  async getReviewByAppointmentId(id: number) {
    return this.reviewRepository.findOne({
      where: { appointmentId: id },
    })
  }

  async updateReview(params: { id: number }, review: Partial<ReviewEntity>) {
    const upReview = await this.reviewRepository.update(
      {
        id: params.id,
      },
      review,
    )

    if (upReview.affected === 0) return false

    return true
  }

  async findOnReview(id: number, clientId: number) {
    return await this.reviewRepository.findOne({
      where: {
        id,
        clientId,
      },
    })
  }

  async getReviewById(id: number) {
    return await this.reviewRepository.findOne({
      where: { id },
    })
  }

  async findReviews(params: ISearchReviewParam) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .select([
        'review.id',
        'review.rating',
        'review.comment',
        'review.clientId',
        'review.providerId',
        'review.serviceId',
        'review.status',
        'review.appointmentId',
        'review.createdAt',
      ])

    if (params.isClient && params.clientId) {
      if (params.status) {
        if (params.status === ReviewStatusEnum.APPROVED) {
          query.andWhere(
            '(review.status = :status AND (review.clientId = :clientId OR review.status = :status))',
            {
              clientId: params.clientId,
              status: params.status,
            },
          )
        } else {
          query.andWhere(
            '(review.clientId = :clientId AND review.status = :status)',
            {
              clientId: params.clientId,
              status: params.status,
            },
          )
        }
      } else {
        query.andWhere(
          '(review.clientId = :clientId OR review.status = :approvedStatus)',
          {
            clientId: params.clientId,
            approvedStatus: ReviewStatusEnum.APPROVED,
          },
        )
      }

      if (params.providerId) {
        query.andWhere('review.providerId = :providerId', {
          providerId: params.providerId,
        })
      }
    }

    if (params.isProvider && params.providerId) {
      query.andWhere('review.providerId = :providerId', {
        providerId: params.providerId,
      })

      if (params.clientId) {
        query.andWhere('review.clientId = :clientId', {
          clientId: params.clientId,
        })
      }

      if (params.status) {
        query.andWhere('review.status = :status', { status: params.status })
      }
    }

    if (!params.isClient && !params.isProvider) {
      if (params.clientId) {
        query.andWhere('review.clientId = :clientId', {
          clientId: params.clientId,
        })
      }

      if (params.providerId) {
        query.andWhere('review.providerId = :providerId', {
          providerId: params.providerId,
        })
      }

      if (params.status) {
        query.andWhere('review.status = :status', { status: params.status })
      }
    }

    if (params.rating) {
      query.andWhere('review.rating = :rating', { rating: params.rating })
    }

    if (params.serviceId) {
      query.andWhere('review.serviceId = :serviceId', {
        serviceId: params.serviceId,
      })
    }

    if (params.appointmentId) {
      query.andWhere('review.appointmentId = :appointmentId', {
        appointmentId: params.appointmentId,
      })
    }

    if (params.search?.trim()) {
      query.andWhere('review.comment ILIKE :search', {
        search: `%${params.search}%`,
      })
    }

    query.orderBy(`review.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)

    return query.getMany()
  }

  async approvedReviewCount(serviceId: number) {
    return await this.reviewRepository.count({
      where: {
        serviceId,
        status: ReviewStatusEnum.APPROVED,
      },
    })
  }
}
