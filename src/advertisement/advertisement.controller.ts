import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   HttpStatus,
   Param,
   Post,
   Put,
   Query,
} from '@nestjs/common';
import { Authorization } from '../auth/decorators/auth.decorator';
import { UserRole } from '../generated/prisma/enums';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementDto, PaginationDto } from './dto/advertisement.dto';

@Controller('advertisements')
export class AdvertisementController {
   constructor(private readonly advertisementService: AdvertisementService) {}

   //Получение всех реклам для магазина==================
   @HttpCode(HttpStatus.OK)
   @Get()
   async getAll(@Query() dto: PaginationDto) {
      return await this.advertisementService.getAll(dto.page, dto.perPage);
   }

   //Получение рекламы по id==================================
   @HttpCode(HttpStatus.OK)
   @Get('by-id/:advertisementId')
   async getById(@Param('advertisementId') advertisementId: string) {
      return await this.advertisementService.getById(advertisementId);
   }

   //Создание рекламы========================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: AdvertisementDto) {
      return await this.advertisementService.create(dto);
   }

   //Обновление рекламы=====================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':advertisementId')
   async update(
      @Param('advertisementId') advertisementId: string,
      @Body() dto: AdvertisementDto,
   ) {
      return await this.advertisementService.update(advertisementId, dto);
   }

   //Удаление рекламы=======================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':advertisementId')
   async delete(@Param('advertisementId') advertisementId: string) {
      return await this.advertisementService.delete(advertisementId);
   }
}
