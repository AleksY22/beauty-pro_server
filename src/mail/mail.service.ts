/* eslint-disable @typescript-eslint/no-unsafe-return */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { ConfirmationTemplate } from './templates/confirmation.template';
import { OrderCancelledTemplate } from './templates/order-cancelled.template';
import { OrderConfirmationTemplate } from './templates/order-confirmation.template';
import { ResetPasswordTemplate } from './templates/reset-password.template';
import { TwoFactorAuthTemplate } from './templates/two-factor-auth.template';

interface OrderItem {
   id: string;
   quantity: number;
   priceAtPurchase: number;
   variant?: {
      product?: {
         title: string;
      };
   };
}
interface IDelivery {
   name: string;
}

interface IPayment {
   name: string;
}

export interface Order {
   id: string;
   firstName: string;
   total: number;
   items: OrderItem[];
   address: string | null;
   phone: string;
   deliveryMethod: IDelivery;
   paymentMethod: IPayment;
}

@Injectable()
export class MailService {
   public constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService,
   ) {}

   //Подтверждение почты======================================================
   public async sendConfirmationEmail(email: string, token: string) {
      const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
      const html = await render(ConfirmationTemplate({ domain, token }));

      return this.sendMail(email, 'Подтверждение почты', html);
   }

   //Сброс пароля============================================================
   public async sendResetPassword(email: string, token: string) {
      const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
      const html = await render(ResetPasswordTemplate({ domain, token }));

      return this.sendMail(email, 'Сброс пароля', html);
   }

   //2-х факторная аутентификация=============================================
   public async sendTwoFactorToken(email: string, token: string) {
      const html = await render(TwoFactorAuthTemplate({ token }));

      return this.sendMail(email, 'Двухфакторная аутентификация', html);
   }

   //Подтверждение заказа
   public async sendOrderConfirmation(email: string, order: Order) {
      const html = await render(OrderConfirmationTemplate(order));

      return this.sendMail(
         email,
         `BeautyPro | Заказ №${order.id.slice(-6).toUpperCase()} принят!`,
         html,
      );
   }

   //Отмена заказа
   public async sendOrderCancellation(email: string, order: Order) {
      const html = await render(OrderCancelledTemplate(order));

      return this.sendMail(
         email,
         `BeautyPro | Заказ №${order.id.slice(-6).toUpperCase()} отменен!`,
         html,
      );
   }

   //=========================================================================
   private sendMail(email: string, subject: string, html: string) {
      return this.mailerService.sendMail({
         to: email,
         subject,
         html,
      });
   }
}
