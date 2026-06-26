import { Type } from 'class-transformer';
import {
   IsInt,
   IsNotEmpty,
   IsOptional,
   IsString,
   Min,
   MinLength,
} from 'class-validator';

export class AttributeDto {
   @IsString({ message: 'Название атрибута должно быть строкой' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   @MinLength(2, {
      message: 'Название атрибута должно быть не короче 2 символов',
   })
   name: string = ''; // Например: "Размер"
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
