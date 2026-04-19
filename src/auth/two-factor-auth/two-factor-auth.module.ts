import { Module } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma.service';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Module({
   providers: [TwoFactorAuthService, MailService, PrismaService],
})
export class TwoFactorAuthModule {}
