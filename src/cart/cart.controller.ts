import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   HttpStatus,
   Param,
   Post,
} from '@nestjs/common';
import { Authorization } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/user.decorator';
import { CartService } from './cart.service';
import {
   ChangeQuantityDto,
   LocalDetailsDto,
   MergeCartDto,
   ValidateLocalCartDto,
} from './dto/cart.dto';

@Controller('cart')
export class CartController {
   constructor(private readonly cartService: CartService) {}

   // Получить всю корзину текущего пользователя
   @HttpCode(HttpStatus.OK)
   @Authorization()
   @Get()
   async getCart(@CurrentUser('id') userId: string) {
      return this.cartService.getCart(userId);
   }

   @Post('local-details')
   async getLocalCartDetails(@Body() dto: LocalDetailsDto) {
      return this.cartService.getLocalCartDetails(dto);
   }

   @Post('validate')
   async validateLocalCart(@Body() dto: ValidateLocalCartDto) {
      return this.cartService.validateLocalCart(dto);
   }

   // Добавить товар в корзину или обновить количество
   @HttpCode(HttpStatus.OK)
   @Authorization()
   @Post('quantity')
   async updateQuantity(
      @CurrentUser('id') userId: string,
      @Body() dto: ChangeQuantityDto,
   ) {
      return this.cartService.updateQuantity(
         userId,
         dto.variantId,
         dto.quantity,
      );
   }

   // Слияние гостевой корзины с серверной (вызывается сразу после успешного Login)
   @HttpCode(HttpStatus.OK)
   @Authorization()
   @Post('merge')
   async mergeCart(
      @CurrentUser('id') userId: string,
      @Body() dto: MergeCartDto,
   ) {
      return this.cartService.mergeCart(userId, dto.localItems);
   }

   // Удалить один SKU из корзины
   @HttpCode(HttpStatus.OK)
   @Authorization()
   @Delete('item/:variantId')
   async removeItem(
      @CurrentUser('id') userId: string,
      @Param('variantId') variantId: string,
   ) {
      return this.cartService.removeItem(userId, variantId);
   }

   // Полностью очистить корзину пользователя
   @HttpCode(HttpStatus.OK)
   @Authorization()
   @Delete('clear')
   async clearCart(@CurrentUser('id') userId: string) {
      return this.cartService.clearCart(userId);
   }
}
