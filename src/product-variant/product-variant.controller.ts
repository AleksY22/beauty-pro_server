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
import { PaginationDto, ProductVariantDto } from './dto/product-variant.dto';
import { ProductVariantService } from './product-variant.service';

@Controller('variants')
export class ProductVariantController {
   constructor(private readonly variantService: ProductVariantService) {}

   @HttpCode(HttpStatus.OK)
   @Get('product/:productId')
   async getByProduct(
      @Param('productId') productId: string,
      @Query() dto: PaginationDto,
   ) {
      return this.variantService.getByProductId(
         productId,
         dto.page,
         dto.perPage,
      );
   }

   @HttpCode(HttpStatus.OK)
   @Get('by-id/:id')
   async getById(@Param('id') id: string) {
      return this.variantService.getById(id);
   }

   @HttpCode(HttpStatus.OK)
   @Get('by-category/:categoryId')
   async getByCategory(
      @Param('categoryId') categoryId: string,
      @Query('page') page?: string,
      @Query('perPage') perPage?: string,
      @Query('attributes') attributes?: string,
   ) {
      return this.variantService.getByCategory(
         categoryId,
         page ? parseInt(page, 10) : 1,
         perPage ? parseInt(perPage, 10) : 10,
         attributes,
      );
   }

   @HttpCode(HttpStatus.OK)
   @Get('most-popular')
   async getMostPopular() {
      return this.variantService.getMostPopular();
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post('product/:productId')
   async create(
      @Param('productId') productId: string,
      @Body() dto: ProductVariantDto,
   ) {
      return this.variantService.create(productId, dto);
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':id')
   async update(@Param('id') id: string, @Body() dto: ProductVariantDto) {
      return this.variantService.update(id, dto);
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':id')
   async delete(@Param('id') id: string) {
      return this.variantService.delete(id);
   }
}
