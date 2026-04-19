import { forwardRef, Module } from '@nestjs/common';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma.service';
import { UserService } from '../../user/user.service';
import { AuthModule } from '../auth.module';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';

@Module({
   imports: [MailModule, forwardRef(() => AuthModule)],
   controllers: [EmailConfirmationController],
   providers: [
      EmailConfirmationService,
      UserService,
      MailService,
      PrismaService,
   ],
   exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
