import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
   @IsEmail({}, { message: 'Введите корректный адрес электронной почты!' })
   @IsNotEmpty({ message: 'Обязательное поле!' })
   email!: string;
}
