import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteFilesDto {
   @IsArray({ message: 'urls должен быть массивом строк' })
   @IsString({
      each: true,
      message: 'Каждый элемент в urls должен быть строкой',
   })
   @IsNotEmpty({ each: true, message: 'URL не может быть пустой строкой' })
   urls!: string[];
}
