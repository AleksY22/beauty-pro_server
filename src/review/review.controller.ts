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
import { CurrentUser } from '../user/decorators/user.decorator';
import { PaginationDto, ReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
   constructor(private readonly reviewService: ReviewService) {}

   // Получение всех отзывов (для админа)====================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get('all')
   async getAll(@Query() dto: PaginationDto) {
      return this.reviewService.getAll(dto.page, dto.perPage);
   }

   // Получение всех отзывов товара (публичный роут)=============
   @Get('by-product/:variantId')
   async getByProduct(@Param('variantId') variantId: string) {
      return this.reviewService.getByProduct(variantId);
   }

   // Создание отзыва (только для авторизованных)=================
   @HttpCode(HttpStatus.OK)
   @Authorization()
   @Post(':variantId')
   async create(
      @CurrentUser('id') userId: string,
      @Param('variantId') variantId: string,
      @Body() dto: ReviewDto,
   ) {
      return this.reviewService.create(userId, variantId, dto);
   }

   // Обновление отзыва===========================================
   @HttpCode(HttpStatus.OK)
   @Put(':id')
   @Authorization()
   async update(
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
      @Body() dto: ReviewDto,
   ) {
      return this.reviewService.update(id, userId, dto);
   }

   // Удаление отзыва=============================================
   @HttpCode(HttpStatus.OK)
   @Delete(':id')
   @Authorization()
   async delete(
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
      @CurrentUser('role') userRole: UserRole,
   ) {
      return this.reviewService.delete(id, userId, userRole);
   }
}
