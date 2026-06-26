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
import { CategoryService } from './category.service';
import { CategoryDto, PaginationDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
   constructor(private readonly categoryService: CategoryService) {}

   //Получение всех категорий для магазина==================
   @HttpCode(HttpStatus.OK)
   @Get()
   async getAll(@Query() dto: PaginationDto) {
      return await this.categoryService.getAll(dto.page, dto.perPage);
   }

   //Получение категории по id==================================
   @HttpCode(HttpStatus.OK)
   @Get('by-id/:categoryId')
   async getById(@Param('categoryId') categoryId: string) {
      return await this.categoryService.getById(categoryId);
   }

   //Создание категории========================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: CategoryDto) {
      return await this.categoryService.create(dto);
   }

   //Обновление категории=====================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':categoryId')
   async update(
      @Param('categoryId') categoryId: string,
      @Body() dto: CategoryDto,
   ) {
      return await this.categoryService.update(categoryId, dto);
   }

   //Удаление категории=======================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':categoryId')
   async delete(@Param('categoryId') categoryId: string) {
      return await this.categoryService.delete(categoryId);
   }
}
