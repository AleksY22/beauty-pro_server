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
import { PaginationDto, PromotionDto } from './dto/promotion.dto';
import { PromotionService } from './promotion.service';

@Controller('promotions')
export class PromotionController {
   constructor(private readonly promotionService: PromotionService) {}

   //Получение всех акций для магазина==================
   @HttpCode(HttpStatus.OK)
   @Get()
   async getAll(@Query() dto: PaginationDto) {
      return await this.promotionService.getAll(dto.page, dto.perPage);
   }

   //Получение акции по id==================================
   @HttpCode(HttpStatus.OK)
   @Get('by-id/:promotionId')
   async getById(@Param('promotionId') promotionId: string) {
      return await this.promotionService.getById(promotionId);
   }

   //Создание акции========================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: PromotionDto) {
      return await this.promotionService.create(dto);
   }

   //Обновление акции=====================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':promotionId')
   async update(
      @Param('promotionId') promotionId: string,
      @Body() dto: PromotionDto,
   ) {
      return await this.promotionService.update(promotionId, dto);
   }

   //Удаление акции=======================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':promotionId')
   async delete(@Param('promotionId') promotionId: string) {
      return await this.promotionService.delete(promotionId);
   }
}
