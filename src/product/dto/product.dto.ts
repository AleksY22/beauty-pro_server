import { Type } from 'class-transformer';
import {
   ArrayMinSize,
   IsInt,
   IsNotEmpty,
   IsOptional,
   IsString,
   Min,
} from 'class-validator';

export class ProductDto {
   //=====================================================
   @IsString({ message: 'Название должно быть строкой!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   title!: string;

   //======================================================
   @IsString({ message: 'Описание должно быть строкой!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   description!: string;

   //======================================================
   @IsString({
      message: 'Ссылка на картинку должна быть строкой!',
      each: true,
   })
   @ArrayMinSize(1, { message: 'Должна быть хотя бы одна картинка!' })
   @IsNotEmpty({
      message: 'Путь к картине не может быть пустым!',
      each: true,
   })
   images!: string[];

   //=======================================================
   @IsString({ message: 'Категория должна быть строкой!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   categoryId!: string;
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
