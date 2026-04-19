/* eslint-disable prettier/prettier */
import { Body, Heading, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react"

interface TwoFactorAuthTemplateProps {
  token: string;
}

export function TwoFactorAuthTemplate({token}: TwoFactorAuthTemplateProps) {

   return (
      <Tailwind>
         <Html>
            <Body>
               <Heading>Двухфакторная аутентификация</Heading>
               <Text>
                  Ваш код двухфакторной аутентификации: <strong>{token}</strong>
               </Text>
               <Text>
                  Введите этот код в приложении для завершения процесса аутентификации.
               </Text>
               <Text>
                  Если вы не запрашивали этот код, просто игнорируйте это сообщение.
               </Text>
               <Text>
                  Спасибо за использование нашего сервиса!
               </Text>
            </Body>
         </Html>
      </Tailwind>
   );
}