import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { del, put } from '@vercel/blob';

@Injectable()
export class FileService {
   //======================================================
   async saveFiles(files: Express.Multer.File[], folder: string = 'products') {
      const response = await Promise.all(
         files.map(async (file) => {
            // Формируем путь внутри хранилища (префикс папки)
            const filename = `${folder}/${Date.now()}-${file.originalname}`;

            try {
               // Загружаем файл напрямую из буфера
               const blob = await put(filename, file.buffer, {
                  access: 'public', // Делаем файл доступным по прямой ссылке
                  contentType: file.mimetype,
               });

               return {
                  url: blob.url, // Прямая ссылка на Vercel Blob
                  name: blob.pathname, // Путь внутри хранилища
               };
            } catch (error) {
               console.error(`Failed to upload ${file.originalname}:`, error);
               throw error;
            }
         }),
      );

      return response;
   }

   //=====================================================
   async deleteFiles(urls: string | string[]) {
      // Приводим к массиву: если пришла строка, оборачиваем в массив.
      // Если null/undefined — делаем пустой массив.
      const rawUrls = Array.isArray(urls) ? urls : urls ? [urls] : [];

      // Фильтруем пустые строки
      const validUrls = rawUrls.filter(
         (url) => typeof url === 'string' && url.trim() !== '',
      );

      if (validUrls.length === 0)
         return { success: true, message: 'Нет файлов для удаления' };

      try {
         await del(validUrls);
         return { success: true };
      } catch (error) {
         throw new InternalServerErrorException(
            `Ошибка при удалении файлов: ${error}`,
         );
      }
   }
}
