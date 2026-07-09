import { Controller, Get } from '@nestjs/common';
import { Authorization } from '../auth/decorators/auth.decorator';
import { UserRole } from '../generated/prisma/enums';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
@Authorization(UserRole.ADMIN)
export class StatisticsController {
   constructor(private readonly statisticsService: StatisticsService) {}

   @Get('main')
   async getMainStatistics() {
      return await this.statisticsService.getMainStatistics();
   }

   @Get('middle')
   async getMiddleStatistics() {
      return await this.statisticsService.getMiddleStatistics();
   }
}
