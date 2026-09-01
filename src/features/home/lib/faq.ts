export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Qué pasa después de publicar?',
    answer:
      'Revisamos la publicación en menos de 24 h y te avisamos cuando esté visible. No tenés que hacer nada más.',
  },
  {
    question: '¿Cómo me contactan los interesados?',
    answer:
      'Completan un formulario corto. Te llegan sus respuestas y vos decidís a quién le escribís.',
  },
  {
    question: '¿Se ven mi teléfono o mi email?',
    answer: 'Nunca. Tus datos solo se comparten cuando vos aprobás a una persona interesada.',
  },
  {
    question: '¿Puedo arrepentirme?',
    answer: 'Sí. Podés pausar o borrar la publicación en cualquier momento, sin explicaciones.',
  },
  {
    question: '¿Tiene algún costo?',
    answer: 'No. Publicar y adoptar en Homie es gratis.',
  },
  {
    question: '¿Sirve para cualquier especie?',
    answer: 'Sí: perros, gatos, conejos, aves, roedores, reptiles y más.',
  },
];
