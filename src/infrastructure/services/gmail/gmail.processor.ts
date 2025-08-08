/* eslint-disable no-console */
import { Process, Processor } from '@nestjs/bull'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { Job } from 'bull'

import { NotificationTypeEnum } from '@domain/entities/notifications.entity'

import { GmailSevice } from './gmail.service'

interface IEmailJobData {
  email: string
  subject: string
  text: string
  userId?: number
}

@Processor('emailQueue')
export class EmailProcessor {
  constructor(
    private readonly gmailService: GmailSevice,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process()
  async handleEmailJob(job: Job<IEmailJobData>) {
    const { email, subject, text, userId } = job.data
    try {
      if (userId) {
        this.eventEmitter.emit('notification.sent', {
          subject,
          text,
          userId,
          type: NotificationTypeEnum.EMAIL,
        })
      }
      await this.gmailService.sendMail(email, subject, text)
      console.log('Send mail: ', email)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send mail: ${error.message}`)
      } else {
        throw new Error('An unknown error occurred while sending mail')
      }
    }
  }
}
