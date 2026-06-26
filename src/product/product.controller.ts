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
import { PaginationDto, ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
   constructor(private readonly productService: ProductService) {}

   //Получение всех товаров (с опциональным поиском)=============
   @HttpCode(HttpStatus.OK)
   @Get()
   async getAll(
      @Query() dto: PaginationDto,
      @Query('searchTerm') searchTerm?: string,
   ) {
      return this.productService.getAll(searchTerm, dto.page, dto.perPage);
   }

   //Получение самых популярных товаров===========================
   @HttpCode(HttpStatus.OK)
   @Get('most-popular')
   async getMostPopular() {
      return this.productService.getMostPopular();
   }

   //Получение похожих товаров====================================
   @HttpCode(HttpStatus.OK)
   @Get('similar/:variantId')
   async getSimilar(@Param('variantId') variantId: string) {
      return this.productService.getSimilar(variantId);
   }

   //Получение товаров по категории=================================
   @HttpCode(HttpStatus.OK)
   @Get('by-category/:categoryId')
   async getByCategory(@Param('categoryId') categoryId: string) {
      return this.productService.getByCategory(categoryId);
   }

   //Получение одного товара по ID==================================
   @HttpCode(HttpStatus.OK)
   @Get('by-id/:id')
   async getById(@Param('id') id: string) {
      return this.productService.getById(id);
   }

   /* --- ТОЛЬКО ДЛЯ АДМИНИСТРАТОРОВ --- */

   //Создание товара===============================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: ProductDto) {
      return this.productService.create(dto);
   }

   //Обновление товара=============================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':id')
   async update(@Param('id') id: string, @Body() dto: ProductDto) {
      return this.productService.update(id, dto);
   }

   //Удаление товара===============================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':id')
   async delete(@Param('id') id: string) {
      return this.productService.delete(id);
   }
}
