import { IsNotEmpty, IsString } from 'class-validator';

export class EmailConfirmationDto {
   @IsString({ message: 'Токен должен быть строкой!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   token!: string;
}
