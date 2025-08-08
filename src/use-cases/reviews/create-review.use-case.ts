import { Inject, Injectable } from '@nestjs/common'

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'
import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '@domain/repositories/appointment.repository.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '@domain/repositories/review.repository.interface'

import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: ExceptionsService,
  ) {}

  async execute(
    payload: { rating: number; comment?: string },
    params: { appointmentId: number; userId: number },
  ) {
    const client = await this.checkClient(params.userId)

    const appointment = await this.checkAppointment(
      params.appointmentId,
      client.id,
    )

    await this.existingReview(params.appointmentId)

    return await this.reviewRepository.createReview({
      rating: payload.rating,
      comment: payload.comment,
      clientId: appointment.clientId,
      providerId: appointment.providerId,
      serviceId: appointment.serviceId,
      appointmentId: appointment.id,
    })
  }

  private async checkClient(clientId: number) {
    const client = await this.clientRepository.findClientByUserId(clientId)

    if (client == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async checkAppointment(appointmentId: number, clientId: number) {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Appointment not found',
      })
    }

    if (appointment.clientId !== clientId) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You are not the client for this appointment.',
      })
    }
    if (appointment.status !== AppointmentStatusEnum.COMPLETED) {
      throw this.exceptionsService.badRequestException({
        type: 'InvalidAppointmentStatus',
        message: `Only completed appointments can be evaluated. Current status: ${AppointmentStatusEnum[appointment.status]}.`,
      })
    }

    return appointment
  }

  private async existingReview(appointmentId: number) {
    const existingReview =
      await this.reviewRepository.getReviewByAppointmentId(appointmentId)
    if (existingReview) {
      throw this.exceptionsService.badRequestException({
        type: 'ReviewAlreadyExists',
        message: `This appointment has been evaluated by you.`,
      })
    }
  }
}
