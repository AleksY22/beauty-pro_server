/* eslint-disable prettier/prettier */
import {
   Body,
   Container,
   Heading,
   Preview,
   Section,
   Tailwind,
   Text,
} from '@react-email/components';
import { Html } from "@react-email/html";
import * as React from 'react';
import { Order } from "../mail.service";


export const OrderCancelledTemplate = (order : Order) => {
   const orderNumber = order?.id && order.id.length >= 6 
      ? order.id.slice(-6).toUpperCase() 
      : 'NEW-ORDER';

   const previewText = `Заказ №${orderNumber} отменен`;


   return (
      
         <Html>
            <Preview>{previewText}</Preview>
            <Tailwind>
               <Body className="bg-white my-auto mx-auto font-sans">
            <Container className="my-10 mx-auto p-5 max-w-145">
               {/* Заголовок */}
               <Heading className="text-[24px] font-bold text-[#4b5563] pb-2.5 m-0">
                  Заказ №{orderNumber} отменен
               </Heading>
               
               <Text className="text-[16px] leading-6.5 text-[#333333] mt-4">
                  Информируем вас, что ваш заказ №<strong>{orderNumber}</strong> в магазине BeautyPro был отменен.
               </Text>

               {/* Блок с причинами отмены */}
               <Section className="bg-[#f9fafb] p-3.75 rounded-lg border-l-4 border-solid border-[#9ca3af] my-5">
                  <Text className="m-0 mb-2 text-[14px] font-bold text-[#4b5563]">
                     Возможные причины отмены:
                  </Text>
                  <Text className="m-0 mb-1 text-[14px] leading-5 text-[#4b5563]">
                     • Тайм-аут ожидания оплаты (на проведение платежа в шлюзе отводится до 30 минут).
                  </Text>
                  <Text className="m-0 mb-1 text-[14px] leading-5 text-[#4b5563]">
                     • Отмена операции со стороны вашего банка или платежной системы.
                  </Text>
                  <Text className="m-0 mb-1 text-[14px] leading-5 text-[#4b5563]">
                     • Недостаточно средств на балансе карты.
                  </Text>
                  <Text className="m-0 mb-1 text-[14px] leading-5 text-[#4b5563]">
                     • Самостоятельная отмена заказа на странице оплаты.
                  </Text>
               </Section>

               <Text className="text-[14px] leading-5.5 text-[#666666] mt-6">
                  Вы можете собрать новую корзину и повторить попытку в любой момент в нашем магазине
               </Text>
            </Container>
         </Body>
            </Tailwind>
         
      </Html>
      
      
   );
};
