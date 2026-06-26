import {
   Body,
   Controller,
   FileTypeValidator,
   HttpCode,
   HttpStatus,
   MaxFileSizeValidator,
   ParseFilePipe,
   Post,
   Query,
   UploadedFiles,
   UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Authorization } from '../auth/decorators/auth.decorator';
import { UserRole } from '../generated/prisma/enums';
import { DeleteFilesDto } from './dto/file.dto';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
   constructor(private readonly fileService: FileService) {}

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post('upload')
   @UseInterceptors(FilesInterceptor('files'))
   async saveFiles(
      @UploadedFiles(
         new ParseFilePipe({
            validators: [
               // Ограничение 4.5MB (лимит Vercel Serverless по умолчанию)
               new MaxFileSizeValidator({
                  maxSize: 1024 * 1024 * 4.5,
                  message: 'Файл слишком большой! Максимум 4.5MB',
               }),
               // Разрешаем только изображения (можно убрать, если нужны любые файлы)
               new FileTypeValidator({
                  fileType: /^image\/(jpeg|png|webp|svg\+xml)$/,
                  errorMessage:
                     'Неверный формат файла! Разрешены только изображения',
               }),
            ],
            fileIsRequired: true, // Ошибка, если файлов нет в запросе
         }),
      )
      files: Express.Multer.File[],
      @Query('folder') folder?: string,
   ) {
      return this.fileService.saveFiles(files, folder);
   }

   @Post('delete')
   @HttpCode(HttpStatus.OK) // Возвращаем 200 OK вместо дефолтного 201 Created
   async deleteFiles(@Body() dto: DeleteFilesDto) {
      // Вызываем ваш исправленный метод сервиса
      return await this.fileService.deleteFiles(dto.urls);
   }
}
