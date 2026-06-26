import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { ColorController } from './color.controller';
import { ColorService } from './color.service';

@Module({
   imports: [UserModule],
   controllers: [ColorController],
   providers: [ColorService, PrismaService],
})
export class ColorModule {}
