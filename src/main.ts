/* eslint-disable @typescript-eslint/no-floating-promises */
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
//connect-redis v.7.1.1
import RedisStore from 'connect-redis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Redis from 'ioredis';
import { AppModule } from './app.module';
import { ms, StringValue } from './libs/utils/ms.util';
import { parseBoolean } from './libs/utils/parse-boolean.util';

async function bootstrap() {
   // const app = await NestFactory.create(AppModule);
   const app = await NestFactory.create<NestExpressApplication>(AppModule);

   const config = app.get(ConfigService);

   app.set('trust proxy', 1);

   const redis = new Redis(config.getOrThrow('REDIS_URL'));

   const isProduction = process.env.NODE_ENV === 'production';

   app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));

   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
      }),
   );

   app.use(
      session({
         secret: config.getOrThrow<string>('SESSION_SECRET'),
         name: config.getOrThrow<string>('SESSION_NAME'),
         resave: true,
         saveUninitialized: false,
         cookie: {
            domain: isProduction
               ? undefined
               : config.get<string>('SESSION_DOMAIN'),
            maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
            httpOnly: parseBoolean(
               config.getOrThrow<string>('SESSION_HTTP_ONLY'),
            ),
            secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
            sameSite: isProduction ? 'none' : 'lax',
         },
         store: new RedisStore({
            client: redis,
            prefix: config.getOrThrow<string>('SESSION_FOLDER'),
            // ttl: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
            // disableTouch: true,
         }),
      }),
   );

   app.enableCors({
      // origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
      origin: [process.env.CLIENT_URL!],
      credentials: true,
      // exposedHeaders: ['set-cookie'],
   });

   await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}
bootstrap();
