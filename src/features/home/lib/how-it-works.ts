export interface HowItWorksStep {
  number: string;
  title: string;
  detail: string;
  icon: 'chat' | 'camera' | 'shield' | 'home';
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: '01',
    title: 'Contanos cómo es.',
    detail: 'Nombre, edad, salud y carácter. Cinco pasos cortos.',
    icon: 'chat',
  },
  {
    number: '02',
    title: 'Subí sus fotos.',
    detail: 'Con dos o tres alcanza. Las comprimimos y les quitamos la ubicación.',
    icon: 'camera',
  },
  {
    number: '03',
    title: 'Leé las cartas.',
    detail: 'Cada interesado se presenta con nombre, ciudad y tipo de hogar.',
    icon: 'shield',
  },
  {
    number: '04',
    title: 'Elegí su familia.',
    detail: 'Respondés por el chat y compartís tu WhatsApp solo si querés.',
    icon: 'home',
  },
];
