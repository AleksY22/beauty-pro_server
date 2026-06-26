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
import { PaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
   constructor(private readonly paymentService: PaymentService) {}

   // Для чекаута: Получение ВСЕХ активных методов доставки без пагинации
   @Get('available')
   async getAvailable() {
      return this.paymentService.getAvailable();
   }

   // Получение всех методов оплаты
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get()
   async getAll(
      @Query('page') page?: string,
      @Query('perPage') perPage?: string,
   ) {
      return await this.paymentService.getAll(
         page ? Number(page) : undefined,
         perPage ? Number(perPage) : undefined,
      );
   }

   // Получение метода оплаты по id
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get('by-id/:paymentId')
   async getById(@Param('paymentId') paymentId: string) {
      return await this.paymentService.getById(paymentId);
   }

   // Создание метода оплаты
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: PaymentDto) {
      return await this.paymentService.create(dto);
   }

   // Обновление метода оплаты
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':paymentId')
   async update(
      @Param('paymentId') paymentId: string,
      @Body() dto: PaymentDto,
   ) {
      return await this.paymentService.update(paymentId, dto);
   }

   // Удаление метода оплаты
   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':paymentId')
   async delete(@Param('paymentId') paymentId: string) {
      return await this.paymentService.delete(paymentId);
   }
}
