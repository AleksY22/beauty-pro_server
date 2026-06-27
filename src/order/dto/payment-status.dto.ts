class AmountPayment {
   value!: string;
   currency!: string;
}

class ObjectPayment {
   id!: string;
   status!: string;
   amount!: AmountPayment;
   payment_method!: {
      type: string;
      id: string;
      saved: boolean;
      title: string;
      card: object;
   };
   created_at!: string;
   expires_at!: string;
   description!: string;
   metadata?: {
      orderId?: string;
      [key: string]: string | undefined; // Разрешает любые другие кастомные поля
   };
}

export class PaymentStatusDto {
   event!:
      | 'payment.succeeded'
      | 'payment.waiting_for_capture'
      | 'payment.cancelled'
      | 'refund.succeeded';
   type!: string;
   object!: ObjectPayment;
}
