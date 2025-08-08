import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import cookieParser from 'cookie-parser'
import { json } from 'express'
import { IncomingMessage } from 'http'

import { AppModule } from './app.module'
import { AllExceptionFilter } from './infrastructure/common/filter/exception.filter'
import { LoggingInterceptor } from './infrastructure/common/interceptors/logger.interceptor'
import {
  ResponseFormat,
  ResponseInterceptor,
} from './infrastructure/common/interceptors/response.interceptor'
import { ValidationPipe as CustomValidationPipe } from './infrastructure/common/pipes/validation.pipe'
import { LoggerService } from './infrastructure/logger/logger.service'

async function bootstrap() {
  const env = process.env.NODE_ENV
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })

  app.use(cookieParser())
  app.use(
    '/api/v1/payments/webhooks/stripe',
    json({
      verify: (req: IncomingMessage & { rawBody?: Buffer }, res, buf) => {
        req.rawBody = buf
      },
      type: () => true,
    }),
  )

  // Register global exception filter
  app.useGlobalFilters(new AllExceptionFilter(new LoggerService()))

  // Register global pipes
  app.useGlobalPipes(new CustomValidationPipe())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )

  // Register global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()))
  app.useGlobalInterceptors(new ResponseInterceptor())

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
    prefix: 'api/v',
  })

  // Configure Swagger for API documentation
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [ResponseFormat],
      deepScanRoutes: true,
    })
    SwaggerModule.setup('api', app, document)
  }

  await app.listen(3000)
}

// Bootstrap the application
bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Error during bootstrap:', error)
})
