import { Type } from 'class-transformer';
import {
   IsBoolean,
   IsInt,
   IsNotEmpty,
   IsOptional,
   IsString,
   Min,
} from 'class-validator';

export class PaymentDto {
   //======================================================
   @IsString({
      message: 'Название должно быть строкой!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   name!: string;

   //======================================================
   @IsString({
      message: 'Кодовое обозначение должно быть строкой!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   code!: string;

   //======================================================
   @IsString({
      message: 'Описание должно быть строкой!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   description!: string;

   //======================================================
   @IsBoolean({
      message: 'Статус должен быть булевым значением!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   isEnabled!: boolean;

   //======================================================
   @IsString({
      message: 'Инструкция должна быть строкой!',
   })
   instruction?: string;
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
