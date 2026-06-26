import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
   imports: [AuthModule, UserModule],
   controllers: [CartController],
   providers: [CartService, PrismaService],
   exports: [CartService],
})
export class CartModule {}
