import { Injectable } from '@nestjs/common'

import Redis from 'ioredis'

import { IRedisService } from '@domain/services/redis.interface'

@Injectable()
export class RedisService implements IRedisService {
  constructor(private readonly redis: Redis) {}

  async getRatingData(serviceId: number) {
    const key = `service${serviceId}:ratings`

    const data = await this.redis.hgetall(key)

    return {
      totalRating: data.totalRating ? parseFloat(data.totalRating) : 0,
      totalReview: data.totalReview ? parseInt(data.totalReview, 10) : 0,
      avgRating: data.avgRating ? parseFloat(data.avgRating) : 0,
    }
  }

  async updateRatingData(serviceId: number, rating: number) {
    const key = `service${serviceId}:ratings`

    const totalRatingField = 'totalRating'
    const totalReviewField = 'totalReview'
    const avgRatingField = 'avgRating'

    const currentTotalRating = await this.redis.hincrbyfloat(
      key,
      totalRatingField,
      rating,
    )
    const currentTotalReview = await this.redis.hincrby(
      key,
      totalReviewField,
      1,
    )
    const totalRating = parseFloat(Number(currentTotalRating).toFixed(1))
    const totalReview = currentTotalReview

    const avgRating = parseFloat((totalRating / totalReview).toFixed(1))

    await this.redis.hset(key, totalRatingField, totalRating)
    await this.redis.hset(key, avgRatingField, avgRating)
  }

  async removeRatingData(serviceId: number, rating: number) {
    const key = `service${serviceId}:ratings`

    const totalRatingField = 'totalRating'
    const totalReviewField = 'totalReview'
    const avgRatingField = 'avgRating'

    const currentTotalRating = await this.redis.hget(key, totalRatingField)
    const currentTotalReview = await this.redis.hget(key, totalReviewField)

    let totalRating = parseFloat(currentTotalRating || '0')
    let totalReview = parseInt(currentTotalReview || '0', 10)

    if (totalReview <= 1) {
      totalReview = 0
      totalRating = 0
    } else {
      totalRating -= rating
      totalReview -= 1
    }

    const avgRating =
      totalReview === 0 ? 0 : parseFloat((totalRating / totalReview).toFixed(1))

    await this.redis.hset(key, {
      [totalRatingField]: totalRating,
      [totalReviewField]: totalReview,
      [avgRatingField]: avgRating,
    })
  }
}
