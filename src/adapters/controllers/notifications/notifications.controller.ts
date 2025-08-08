import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { GetListNotificationUseCase } from '@use-cases/notifications/get-list-notification.use-case'

import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { GetListNotificationDto } from './dto/get-list-notification.dto'
import { GetListNotificationPresenter } from './presenter/get-list-notification.presenter'

@Controller('notifications')
@ApiTags('notifications')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class NotificationController {
  constructor(
    private readonly getListNotificationUseCase: GetListNotificationUseCase,
  ) {}

  @Get()
  @ApiBody({ type: GetListNotificationDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list notifications',
    description: 'Get list notifications',
  })
  @ApiExtraModels(GetListNotificationPresenter)
  @ApiCreatedResponseType(GetListNotificationPresenter, false)
  async listNotification(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListNotificationDto,
  ) {
    const notifications = await this.getListNotificationUseCase.execute({
      ...querySearchParam,
      id: userId,
    })

    return notifications.map((noti) => new GetListNotificationPresenter(noti))
  }
}
