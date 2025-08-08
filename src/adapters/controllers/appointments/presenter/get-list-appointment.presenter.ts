import { ApiProperty } from '@nestjs/swagger'

import { CreateAppointmentPresenter } from './create-appointment.presenter'

export class GetListAppointmentPresenter extends CreateAppointmentPresenter {
  @ApiProperty()
  clientId: number

  @ApiProperty()
  providerId: number

  constructor({
    id,
    serviceId,
    appointmentTime,
    status,
    paymentStatus,
    clientId,
    providerId,
  }: GetListAppointmentPresenter) {
    super({ id, serviceId, appointmentTime, status, paymentStatus })
    this.clientId = clientId
    this.providerId = providerId
  }
}
