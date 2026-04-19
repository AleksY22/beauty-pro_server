import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient {
   constructor() {
      const adapter = new PrismaPg({
         connectionString: process.env.DATABASE_URL as string,
      });
      super({ adapter });
   }
}
