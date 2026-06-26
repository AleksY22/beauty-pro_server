import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class PromotionDto {
   //======================================================
   @IsString({
      message: 'Название должно быть строкой!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   title!: string;

   //======================================================
   @IsString({
      message: 'Дата должна быть строкой!',
   })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   date!: string;

   //======================================================
   @IsString({
      message: 'Ссылка на картинку должна быть строкой!',
   })
   @IsNotEmpty({
      message: 'Путь к картине не может быть пустым!',
   })
   image!: string;
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
