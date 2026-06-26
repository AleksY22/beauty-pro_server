import { Type } from 'class-transformer';
import {
   IsArray,
   IsEmail,
   IsEnum,
   IsInt,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
   Min,
   ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../../generated/prisma/enums';

export class OrderDto {
   //======================================
   @IsOptional()
   @IsEnum(OrderStatus, {
      message: 'Некорректный статус заказа!',
   })
   status?: OrderStatus;

   //======================================
   @IsArray({ message: 'В заказе нет товаров!' })
   @ValidateNested({ each: true })
   @Type(() => OrderItemDto)
   items!: OrderItemDto[];

   //=======================================
   @IsString()
   @IsNotEmpty()
   firstName!: string;

   //=======================================
   @IsString()
   @IsOptional()
   lastName?: string;

   //=======================================
   @IsString()
   @IsNotEmpty({ message: 'Телефон обязателен!' })
   phone!: string;

   //=======================================
   @IsEmail({}, { message: 'Некорректный формат Email!' })
   @IsNotEmpty({ message: 'Email обязателен!' })
   email!: string;

   //=======================================
   @IsString()
   @IsOptional()
   address?: string;

   //=======================================
   @IsString()
   @IsOptional()
   comment?: string;

   //=======================================
   @IsString()
   @IsNotEmpty({ message: 'Выберите способ доставки!' })
   deliveryMethodId!: string;

   //=======================================
   @IsString()
   @IsNotEmpty({ message: 'Выберите способ оплаты!' })
   paymentMethodId!: string;
}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export class OrderItemDto {
   //=======================================
   @IsNumber({}, { message: 'Количество должно быть числом!' })
   quantity!: number;

   //========================================
   @IsString({ message: 'Значение для товара должно быть строкой!' })
   variantId!: string;
}

//======================================================
export class UpdateOrderStatusDto {
   @IsNotEmpty({ message: 'Статус обязателен для заполнения' })
   @IsEnum(OrderStatus, { message: 'Некорректный статус заказа!' })
   status!: OrderStatus;
}

export class PaginationDto {
   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
   page?: number = 1; // значение по умолчанию

   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
   perPage?: number = 10; // значение по умолчанию
}
