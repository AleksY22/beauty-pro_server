import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { AttributeModule } from './attribute/attribute.module';
import { AuthModule } from './auth/auth.module';
import { EmailConfirmationModule } from './auth/email-confirmation/email-confirmation.module';
import { PasswordRecoveryModule } from './auth/password-recovery/password-recovery.module';
import { ProviderModule } from './auth/provider/provider.module';
import { TwoFactorAuthModule } from './auth/two-factor-auth/two-factor-auth.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { ColorModule } from './color/color.module';
import { DeliveryModule } from './delivery/delivery.module';
import { FileModule } from './file/file.module';
import { IS_DEV_ENV } from './libs/utils/is-dev.util';
import { MailModule } from './mail/mail.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ProductModule } from './product/product.module';
import { PromotionModule } from './promotion/promotion.module';
import { ReviewModule } from './review/review.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UserModule } from './user/user.module';
import { VariantPropertyModule } from './variant-property/variant-property.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         ignoreEnvFile: !IS_DEV_ENV,
         isGlobal: true,
      }),
      AuthModule,
      UserModule,
      ProviderModule,
      MailModule,
      EmailConfirmationModule,
      PasswordRecoveryModule,
      TwoFactorAuthModule,
      CategoryModule,
      PromotionModule,
      AdvertisementModule,
      FileModule,
      OrderModule,
      CartModule,
      StatisticsModule,
      ProductModule,
      ReviewModule,
      ColorModule,
      AttributeModule,
      ProductVariantModule,
      VariantPropertyModule,
      DeliveryModule,
      PaymentModule,
   ],
})
export class AppModule {}
