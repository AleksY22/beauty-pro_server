import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
   imports: [
      UserModule,
      CacheModule.register({
         isGlobal: true, // Чтобы не импортировать везде
      }),
   ],
   controllers: [StatisticsController],
   providers: [StatisticsService, PrismaService],
})
export class StatisticsModule {}
