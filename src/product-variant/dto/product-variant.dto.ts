import { Type } from 'class-transformer';
import {
   IsArray,
   IsInt,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsPositive,
   IsString,
   Min,
   ValidateNested,
} from 'class-validator';
import { VariantPropertyDto } from '../../variant-property/dto/variant-property.dto';

export class ProductVariantDto {
   //=======================================================
   @IsNumber({}, { message: 'Цена должна быть числом!' })
   @IsPositive()
   @IsNotEmpty({ message: 'Обязательное поле!' })
   price!: number;

   //=======================================================
   @IsString({ message: 'Код должен быть строкой!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   sku!: string;

   //=======================================================
   @IsNumber({}, { message: 'Количество на складе должно быть числом!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   @Min(0)
   stock!: number;

   //=======================================================
   @IsNumber({}, { message: 'Скидка должна быть числом!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   @Min(0)
   discount!: number;

   //=======================================================
   @IsOptional()
   @IsString()
   colorId?: string;

   //=======================================================
   @IsArray()
   @IsOptional()
   @ValidateNested({ each: true })
   @Type(() => VariantPropertyDto)
   properties?: VariantPropertyDto[];
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

   @IsOptional()
   @IsString() // Наша строка динамических свойств вида "Цвет:Красный;Объем:10мл"
   attributes?: string;
}
