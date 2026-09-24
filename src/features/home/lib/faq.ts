import { SITE } from '@/lib/site';

export interface FaqItem {
  id: string;
  question: string;
  /** Un párrafo por elemento: respuestas cortas de leer, sin muros de texto. */
  answer: string[];
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'despues-de-publicar',
    question: '¿Qué pasa después de publicar?',
    answer: [
      'Revisamos tu publicación en menos de 24 horas para cuidar que todo esté en orden. Apenas esté visible, te avisamos.',
      'Desde ese momento, cada persona interesada te llega por el buzón anónimo. No tenés que estar pendiente de nada: te escribimos cuando haya algo nuevo.',
      'Sabemos que no es una decisión fácil. Por eso vas a tu ritmo: podés leer los mensajes cuando te sientas listo o lista.',
    ],
  },
  {
    id: 'como-me-contactan',
    question: '¿Cómo me contactan los interesados?',
    answer: [
      `A través de un buzón anónimo dentro de ${SITE.name}. Quien quiere adoptar te escribe desde la publicación, contándote quién es, cómo es su casa y por qué quiere sumar a tu mascota a su familia.`,
      'Vos recibís un aviso, leés con calma y respondés desde el mismo buzón. Toda la conversación sucede ahí, sin exponer tu número ni tu email.',
      'Si alguien no te da confianza, simplemente no le respondés. No hace falta explicar nada.',
    ],
  },
  {
    id: 'datos-visibles',
    question: '¿Se ven mi teléfono o mi email?',
    answer: [
      `No. ${SITE.name} oculta tus datos de contacto siempre. No aparecen en la publicación, ni en la vista previa al compartirla, ni se envían automáticamente a nadie.`,
      'Solo cuando vos decidís "revelar contacto" a una persona en particular, esa persona (y únicamente ella) puede ver tu WhatsApp o tu email. Tus datos, privados, hasta que vos digas lo contrario.',
    ],
  },
  {
    id: 'arrepentirme',
    question: '¿Puedo arrepentirme?',
    answer: [
      'Sí, y está bien. Mientras la adopción no esté cerrada, podés pausar o borrar tu publicación cuando quieras, sin dar explicaciones.',
      'Si ya estabas conversando con alguien, le avisamos con respeto que la publicación dejó de estar disponible. Nadie va a presionarte.',
    ],
  },
  {
    id: 'costo',
    question: '¿Tiene algún costo?',
    answer: [
      `No. ${SITE.name} es 100% gratis, para quien publica y para quien adopta. Sin planes pagos, sin comisiones y sin letra chica.`,
      'Y una regla importante: en ninguna publicación se puede pedir dinero a cambio de una mascota. Si alguien lo hace, avisanos y lo damos de baja.',
    ],
  },
  {
    id: 'especies',
    question: '¿Sirve para cualquier especie?',
    answer: [
      'Sí. Perros, gatos, conejos, roedores, aves, reptiles y cualquier otra mascota de compañía cuya tenencia sea legal.',
      'El formulario se adapta a cada especie: por ejemplo, solo te preguntamos el tamaño cuando realmente ayuda a quien adopta a imaginarse la convivencia.',
    ],
  },
];
