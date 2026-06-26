/* eslint-disable prettier/prettier */
import { Body, Container, Head, Heading, Hr, Preview, Section, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react"
import { Order } from "../mail.service";


export const OrderConfirmationTemplate = ( order:Order) => {
   const orderNumber = order?.id ? order.id
      : 'NEW-ORDER';
   const deliveryName = order.deliveryMethod?.name || 'Не указан';
   const paymentName = order.paymentMethod?.name || 'Не указан';
   const previewText = `Ваш заказ №${orderNumber} принят в обработку!`;

   return (
      
         <Html>
            <Head />
         <Preview>{previewText}</Preview>
         <Tailwind>
            <Body className="bg-white my-auto mx-auto font-sans">
               <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 max-w-145">
                  <Heading className="text-[#e11d48] text-[24px] font-bold text-left p-0 m-0 pb-2.5">
                  Спасибо за заказ в BeautyPro!
               </Heading>
               <Text className="text-[16px] leading-6 text-[#333] mt-4">
                  Ваш заказ №<strong>{orderNumber}</strong> принят в обработку!
               </Text>
               <Section className="bg-[#f9fafb] p-4 rounded-lg my-5 border border-solid border-[#e5e7eb]">
                  <Text className="text-[14px] m-0 mb-1.5 text-[#4b5563]">
                     Метод доставки: <strong>{deliveryName}</strong>
                  </Text>
                  <Text className="text-[14px] m-0 mb-1.5 text-[#4b5563]">
                     Метод оплаты: <strong>{paymentName}</strong>
                  </Text>
                  {order.address && (
                     <Text className="text-[14px] m-0 mb-1.5 text-[#4b5563]">
                     Адрес: <strong>{order.address}</strong>
                  </Text>
                  )}
                  <Text className="text-[14px] m-0 mb-1.5 text-[#4b5563]">
                     Телефон: <strong>{order.phone}</strong>
                  </Text>
               </Section>
               {order.items?.map((item) => (
                  <Section key={item.id} className="px-2 py-3 border border-solid border-[#dddddd] flex flex-row items-center">
                     <Text className="m-0 text-[14px] text-[#555] w-[60%] text-left line-clamp-2">
                        {item.variant?.product?.title || 'Товар без названия'}
                     </Text>
                     <Text className="m-0 text-[14px] text-[#555] w-[20%] text-center">
                        {item.quantity} шт.
                     </Text>
                     <Text className="m-0 text-[14px] text-[#555] w-[20%] text-right">
                        {Number(item.priceAtPurchase || 0).toFixed(2)} BYN
                     </Text>
                  </Section>
               ))}
               <Section className="mt-4 text-right">
                  <Text className="m-0 text-[16px] font-bold text-[#333]">
                     Стоимость: <span className="text-[#e11d48]">{Number(order.total || 0).toFixed(2)} BYN</span>
                  </Text>
               </Section>
               
               <Hr className="border-[#cccccc] my-5"/>

               <Text className="text-[14px] text-[#666] leading-5.5 m-0">
                  Вы можете отслеживать статус заказа в своем личном кабинете
               </Text>
               </Container>
            </Body>
         </Tailwind>
            
         </Html>
      
   );
};


