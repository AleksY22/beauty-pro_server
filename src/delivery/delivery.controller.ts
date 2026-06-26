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
import { DeliveryService } from './delivery.service';
import { DeliveryDto } from './dto/delivery.dto';

@Controller('deliveries')
export class DeliveryController {
   constructor(private readonly deliveryService: DeliveryService) {}

   // Для чекаута: Получение ВСЕХ активных методов доставки без пагинации
   @Get('available')
   async getAvailable() {
      return this.deliveryService.getAvailable();
   }

   // Получение всех методов доставки
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get()
   async getAll(
      @Query('page') page?: string,
      @Query('perPage') perPage?: string,
   ) {
      return await this.deliveryService.getAll(
         page ? Number(page) : undefined,
         perPage ? Number(perPage) : undefined,
      );
   }

   // Получение метода доставки по id
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get('by-id/:deliveryId')
   async getById(@Param('deliveryId') deliveryId: string) {
      return await this.deliveryService.getById(deliveryId);
   }

   // Создание метода доставки
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: DeliveryDto) {
      return await this.deliveryService.create(dto);
   }

   // Обновление метода доставки
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':deliveryId')
   async update(
      @Param('deliveryId') deliveryId: string,
      @Body() dto: DeliveryDto,
   ) {
      return await this.deliveryService.update(deliveryId, dto);
   }

   // Удаление метода доставки
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':deliveryId')
   async delete(@Param('deliveryId') deliveryId: string) {
      return await this.deliveryService.delete(deliveryId);
   }
}
