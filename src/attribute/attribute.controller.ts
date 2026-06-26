import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   HttpStatus,
   Param,
   Post,
   Put,
   Query,
} from '@nestjs/common';
import { Authorization } from '../auth/decorators/auth.decorator';
import { UserRole } from '../generated/prisma/enums';
import { AttributeService } from './attribute.service';
import { AttributeDto, PaginationDto } from './dto/attribute.dto';

@Controller('attributes')
export class AttributeController {
   constructor(private readonly attributeService: AttributeService) {}

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get()
   async getAll(@Query() dto: PaginationDto) {
      return this.attributeService.getAll(dto.page, dto.perPage);
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Get('by-id/:id')
   async getById(@Param('id') id: string) {
      return this.attributeService.getById(id);
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Post()
   async create(@Body() dto: AttributeDto) {
      return this.attributeService.create(dto);
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Put(':id')
   async update(@Param('id') id: string, @Body() dto: AttributeDto) {
      return this.attributeService.update(id, dto);
   }

   @HttpCode(HttpStatus.OK)
   @Authorization(UserRole.ADMIN)
   @Delete(':id')
   async delete(@Param('id') id: string) {
      return this.attributeService.delete(id);
   }
}
