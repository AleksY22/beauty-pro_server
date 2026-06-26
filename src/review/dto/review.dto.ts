import { Type } from 'class-transformer';
import {
   IsInt,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
   Max,
   Min,
} from 'class-validator';

export class ReviewDto {
   @IsString({
      message: 'Отзыв должен быть строкой!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   text!: string;

   @IsNumber({}, { message: 'Рейтинг должен быть числом!' })
   @Min(1, { message: 'Минимальный рейтинг - 1' })
   @Max(5, { message: 'Максимальный рейтинг - 5' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   rating!: number;
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
