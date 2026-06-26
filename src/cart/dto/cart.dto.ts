import { Type } from 'class-transformer';
import {
   IsArray,
   IsInt,
   IsNotEmpty,
   IsString,
   Min,
   ValidateNested,
} from 'class-validator';

export class LocalCartItemDto {
   @IsString()
   @IsNotEmpty()
   variantId!: string;

   @IsInt()
   @Min(1)
   quantity!: number;
}

//ДТО для запроса информации о товарах
export class LocalDetailsDto {
   @IsArray()
   @IsString({ each: true })
   @IsNotEmpty({ each: true })
   variantIds!: string[];
}

//ДТО для валидации всей гостевой корзины целиком
export class ValidateLocalCartDto {
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => LocalCartItemDto)
   items!: LocalCartItemDto[];
}

export class ChangeQuantityDto {
   @IsString()
   @IsNotEmpty()
   variantId!: string;

   @IsInt()
   @Min(1)
   quantity!: number;
}

export class MergeCartDto {
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => LocalCartItemDto)
   localItems!: LocalCartItemDto[];
}
