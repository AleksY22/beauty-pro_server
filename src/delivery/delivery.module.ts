import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
   imports: [UserModule],
   controllers: [DeliveryController],
   providers: [DeliveryService, PrismaService],
})
export class DeliveryModule {}
