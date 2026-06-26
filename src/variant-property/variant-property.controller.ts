import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   Post,
   Put,
   UsePipes,
   ValidationPipe,
} from '@nestjs/common';
import {
   CreateVariantPropertyDto,
   UpdateVariantPropertyDto,
} from './dto/variant-property.dto';
import { VariantPropertyService } from './variant-property.service';

@Controller('variant-properties')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class VariantPropertyController {
   constructor(private readonly propertyService: VariantPropertyService) {}

   @Get('variant/:variantId')
   async getByVariant(@Param('variantId') variantId: string) {
      return this.propertyService.getByVariantId(variantId);
   }

   @Post()
   async create(@Body() dto: CreateVariantPropertyDto) {
      return this.propertyService.create(dto);
   }

   @Put(':id')
   async update(
      @Param('id') id: string,
      @Body() dto: UpdateVariantPropertyDto,
   ) {
      return this.propertyService.update(id, dto);
   }

   @Delete(':id')
   async delete(@Param('id') id: string) {
      return this.propertyService.delete(id);
   }
}
