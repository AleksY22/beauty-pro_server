import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';

@Module({
   controllers: [AttributeController],
   providers: [AttributeService, PrismaService, UserService],
})
export class AttributeModule {}
