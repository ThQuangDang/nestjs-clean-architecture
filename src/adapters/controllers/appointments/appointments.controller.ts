import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { CreateAppointmentUseCase } from '@use-cases/appointments/create-appointment.use-case'
import { GetDetailAppointmentUseCase } from '@use-cases/appointments/get-detail-appointment.use-case'
import { GetListAppointmentUseCase } from '@use-cases/appointments/get-list-appointment.use-case'
import { UpdateStatusAppointmentUseCase } from '@use-cases/appointments/update-status-appointment.use-case'
import { UpdateTimeAppointmentUseCase } from '@use-cases/appointments/update-time-appointment.use-case'

import {
  ActionEnum,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'

import { CheckPolicies } from '../common/decorators/police-handler/check-policies.decorator'
import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PolicesGuard } from '../common/guards/police-guards/policies.guard'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { GetListAppointmentDto } from './dto/get-list-appointment.dto'
import { UpdateStatusAppointmentDto } from './dto/update-status-appointment.dto'
import { UpdateTimeAppointmentDto } from './dto/update-time-appointment.dto'
import { CreateAppointmentPresenter } from './presenter/create-appointment.presenter'
import { GetDetailAppointmentPresenter } from './presenter/get-detail-appointment.presenter'
import { GetListAppointmentPresenter } from './presenter/get-list-appointment.presenter'
import { UpdateAppointmentPresenter } from './presenter/update-status-appointment.presenter'
import { UpdateAppointmentTimePresenter } from './presenter/update-time-appointment.presenter'

@Controller('appointments')
@ApiTags('appointments')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class AppointmentController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly updateStatusAppointmentUseCase: UpdateStatusAppointmentUseCase,
    private readonly getListAppointmentUseCase: GetListAppointmentUseCase,
    private readonly getDetailAppointmentUseCase: GetDetailAppointmentUseCase,
    private readonly updateTimeAppointmentUseCase: UpdateTimeAppointmentUseCase,
  ) {}

  @Post(':id')
  @ApiBody({ type: CreateAppointmentDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Create, Appointment),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create appointment',
    description: 'Create a appointment',
  })
  @ApiExtraModels(CreateAppointmentPresenter)
  @ApiCreatedResponseType(CreateAppointmentPresenter, false)
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const appointment = await this.createAppointmentUseCase.execute(
      {
        userId,
        serviceId: id,
      },
      createAppointmentDto,
    )

    return new CreateAppointmentPresenter(appointment)
  }

  @Patch(':id/status')
  @ApiBody({ type: UpdateStatusAppointmentDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.UpdateStatus, Appointment),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update appointment',
    description: 'Update a appointment',
  })
  @ApiExtraModels(UpdateAppointmentPresenter)
  @ApiCreatedResponseType(UpdateAppointmentPresenter, false)
  async updateAppointment(
    @Body() updateStatusAppointmentDto: UpdateStatusAppointmentDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const appointment = await this.updateStatusAppointmentUseCase.execute(
      {
        userId,
        appointmentId: id,
      },
      updateStatusAppointmentDto,
    )

    return new UpdateAppointmentPresenter(appointment)
  }

  @Get()
  @ApiBody({ type: GetListAppointmentDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list appointments',
    description: 'Get list appointments',
  })
  @ApiExtraModels(GetListAppointmentPresenter)
  @ApiCreatedResponseType(GetListAppointmentPresenter, false)
  async listAppointment(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListAppointmentDto,
  ) {
    const appointments = await this.getListAppointmentUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return appointments.map(
      (appoint) => new GetListAppointmentPresenter(appoint),
    )
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get appointment detail',
    description: 'Get detail a appointment',
  })
  @ApiExtraModels(GetDetailAppointmentPresenter)
  @ApiCreatedResponseType(GetDetailAppointmentPresenter, false)
  async detailAppointment(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const appointment = await this.getDetailAppointmentUseCase.execute({
      id,
      userId: userId,
    })

    return new GetDetailAppointmentPresenter(appointment)
  }

  @Patch(':id/time')
  @ApiBody({ type: UpdateTimeAppointmentDto })
  @UseGuards(JwtAuthGuard, PolicesGuard)
  @CheckPolicies((ability: TAppAbility) =>
    ability.can(ActionEnum.Update, Appointment),
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update appointment time',
    description: 'Update a appointment time',
  })
  @ApiExtraModels(UpdateAppointmentTimePresenter)
  @ApiCreatedResponseType(UpdateAppointmentTimePresenter, false)
  async updateAppointmentTime(
    @Body() updateTimeAppointmentDto: UpdateTimeAppointmentDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const appointment = await this.updateTimeAppointmentUseCase.exceute(
      {
        appointmentId: id,
        userId,
      },
      updateTimeAppointmentDto,
    )

    return new UpdateAppointmentTimePresenter(appointment)
  }
}
