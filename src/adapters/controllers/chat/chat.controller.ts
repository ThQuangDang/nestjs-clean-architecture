import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { GetListChatUseCase } from '@use-cases/chat/get-list-chat.use-case'

import { ApiCreatedResponseType } from '../common/decorators/swagger-response.decorator'
import { CurrentUser } from '../common/decorators/user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { GetListChatDto } from './dto/get-list-chat.dto'
import { GetListChatPresenter } from './presenter/get-list-chat.presenter'

@Controller('chats')
@ApiTags('chats')
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class ChatController {
  constructor(private readonly getListChatUseCase: GetListChatUseCase) {}

  @Get()
  @ApiBody({ type: GetListChatDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list chats',
    description: 'Get list chats',
  })
  @ApiExtraModels(GetListChatPresenter)
  @ApiCreatedResponseType(GetListChatPresenter, false)
  async listChat(
    @CurrentUser('id') userId: number,
    @Query() querySearchParam: GetListChatDto,
  ) {
    const chats = await this.getListChatUseCase.execute({
      ...querySearchParam,
      userId: userId,
    })

    return chats.map((chat) => new GetListChatPresenter(chat))
  }
}
