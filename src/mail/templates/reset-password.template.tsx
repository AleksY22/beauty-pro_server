/* eslint-disable prettier/prettier */
import { Body, Heading, Link, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react"

interface ResetPasswordTemplateProps {
  domain: string;
  token: string;
}

export function ResetPasswordTemplate({domain, token}: ResetPasswordTemplateProps) {
   const resetLink = `${domain}/auth/new-password?token=${token}`;

   return (
      <Tailwind>
         <Html>
            <Body className="text-black">
               <Heading>Сброс пароля</Heading>
               <Text>
                  Вы запросили сброс пароля. Перейдите по следующей ссылке, чтобы создать новый пароль:
               </Text>
               <Link href={resetLink}>Подтвердить сброс пароля</Link>
               <Text>
                  Эта ссылка действительна в течении 1 часа. Если вы не запрашивали сброс пароля, просто игнорируйте это сообщение.
               </Text>
               <Text>
                  Спасибо за использование нашего сервиса!
               </Text>
            </Body>
         </Html>
      </Tailwind>
   )
}