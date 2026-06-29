import {
   Body,
   Controller,
   Get,
   HttpCode,
   HttpStatus,
   Param,
   Patch,
   Post,
   Query,
   UseGuards,
} from '@nestjs/common';
import { Authorization } from '../auth/decorators/auth.decorator';
import { User } from '../generated/prisma/client';
import { UserRole } from '../generated/prisma/enums';
import { CurrentUser } from '../user/decorators/user.decorator';
import { OrderDto, PaginationDto, UpdateOrderStatusDto } from './dto/order.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';
import { YookassaIpGuard } from './guards/yookassa-ip.guard';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
   constructor(private readonly orderService: OrderService) {}

   //Все заказы — только для админа========================
   @Authorization(UserRole.ADMIN)
   @Get()
   async getAll(@Query() dto: PaginationDto) {
      return this.orderService.getAll(dto.page, dto.perPage);
   }

   //Заказы текущего пользователя (AuthGuard извлечет пользователя)======
   @Authorization()
   @Get('my-orders')
   async getMyOrders(
      @CurrentUser('id') userId: string,
      @Query() dto: PaginationDto,
   ) {
      return this.orderService.getByUserId(userId, dto.page, dto.perPage);
   }

   //Получение заказа по id==================================
   @Authorization({ isOptional: true })
   @Get('by-id/:orderId')
   async getById(
      @Param('orderId') orderId: string,
      @CurrentUser() user: User | null,
   ) {
      const userId = user?.id || null;
      const userRole = user?.role || null;
      return this.orderService.getById(orderId, userId, userRole);
   }

   //Изменение статуса заказа вручную
   @Authorization(UserRole.ADMIN)
   @HttpCode(HttpStatus.OK)
   @Patch(':orderId/status')
   async updateStatusManual(
      @Param('orderId') orderId: string,
      @Body() dto: UpdateOrderStatusDto,
   ) {
      return this.orderService.updateStatusManual(orderId, dto.status);
   }

   //Создание платежа====================================
   @HttpCode(HttpStatus.OK)
   @Post('place')
   @Authorization({ isOptional: true })
   async checkout(
      @Body() dto: OrderDto,
      @CurrentUser('id') userId: string | null,
   ) {
      return this.orderService.createPayment(dto, userId);
   }

   //Обновление статуса заказа===========================
   @HttpCode(HttpStatus.OK)
   @UseGuards(YookassaIpGuard)
   @Post('status')
   async updateStatus(@Body() dto: PaymentStatusDto) {
      return this.orderService.updateStatus(dto);
   }
}
