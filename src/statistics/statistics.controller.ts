import { Controller, Get } from '@nestjs/common';
import { Authorization } from '../auth/decorators/auth.decorator';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
   constructor(private readonly statisticsService: StatisticsService) {}

   @Authorization()
   @Get('main')
   async getMainStatistics() {
      return await this.statisticsService.getMainStatistics();
   }

   @Authorization()
   @Get('middle')
   async getMiddleStatistics() {
      return await this.statisticsService.getMiddleStatistics();
   }
}
