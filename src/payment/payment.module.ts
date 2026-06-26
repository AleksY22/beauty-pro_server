import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
   imports: [UserModule],
   controllers: [PaymentController],
   providers: [PaymentService, PrismaService],
})
export class PaymentModule {}
