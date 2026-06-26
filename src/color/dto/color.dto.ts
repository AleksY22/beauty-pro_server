import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ColorDto {
   @IsString({
      message: 'Обязательное поле!',
   })
   name!: string;

   @IsString({
      message: 'Обязательное поле!',
   })
   value!: string;
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
