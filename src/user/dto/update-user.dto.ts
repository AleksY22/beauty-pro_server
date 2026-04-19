import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
   @IsString({ message: 'Имя должно быть строкой!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   name!: string;

   @IsString({ message: 'Email должен быть строкой!' })
   @IsEmail({}, { message: 'Некорректный формат email!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   email!: string;

   @IsBoolean({ message: 'isTwoFactorEnabled должно быть булевым значением!' })
   isTwoFactorEnabled!: boolean;
}
