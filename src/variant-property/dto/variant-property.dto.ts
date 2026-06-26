import { IsString, MinLength } from 'class-validator';

export class VariantPropertyDto {
   @IsString()
   value!: string;

   @IsString()
   attributeId!: string;
}

export class CreateVariantPropertyDto {
   @IsString({ message: 'Значение свойства должно быть строкой' })
   @MinLength(1, { message: 'Значение свойства не может быть пустым' })
   value!: string; // Например: "XL" или "128 ГБ"

   @IsString({ message: 'ID варианта должен быть строкой' })
   variantId!: string;

   @IsString({ message: 'ID атрибута должен быть строкой' })
   attributeId!: string;
}

export class UpdateVariantPropertyDto {
   @IsString({ message: 'Значение свойства должно быть строкой' })
   @MinLength(1, { message: 'Значение свойства не может быть пустым' })
   value!: string;
}
