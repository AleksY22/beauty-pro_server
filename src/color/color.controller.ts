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
import { ColorService } from './color.service';
import { ColorDto } from './dto/color.dto';

@Controller('colors')
export class ColorController {
   constructor(private readonly colorService: ColorService) {}

   //Получение всех цветов для магазина==============
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get()
   async getAll(
      @Query('page') page?: string,
      @Query('perPage') perPage?: string,
   ) {
      return await this.colorService.getAll(
         page ? Number(page) : undefined,
         perPage ? Number(perPage) : undefined,
      );
   }

   //Получение цвета по id===================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get('by-id/:colorId')
   async getById(@Param('colorId') colorId: string) {
      return await this.colorService.getById(colorId);
   }

   //Создание цвета========================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: ColorDto) {
      return await this.colorService.create(dto);
   }

   //Обновление цвета=====================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':colorId')
   async update(@Param('colorId') colorId: string, @Body() dto: ColorDto) {
      return await this.colorService.update(colorId, dto);
   }

   //Удаление цвета=======================================
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':colorId')
   async delete(@Param('colorId') colorId: string) {
      return await this.colorService.delete(colorId);
   }
}
