import { Module } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { ProductService } from '../product/product.service';
import { TelegramService } from '../telegram/telegram.service';
import { UserModule } from '../user/user.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
   imports: [UserModule],
   controllers: [OrderController],
   providers: [
      OrderService,
      PrismaService,
      ProductService,
      FileService,
      TelegramService,
      MailService,
   ],
})
export class OrderModule {}
