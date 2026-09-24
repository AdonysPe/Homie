export interface HowItWorksStep {
  number: string;
  title: string;
  detail: string;
  icon: 'chat' | 'camera' | 'shield' | 'home';
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: '01',
    title: 'Cuéntanos cómo es.',
    detail: 'Nombre, edad, salud y carácter. Cinco pasos cortos.',
    icon: 'chat',
  },
  {
    number: '02',
    title: 'Sube sus fotos.',
    detail: 'Con dos o tres alcanza. Las comprimimos y les quitamos la ubicación.',
    icon: 'camera',
  },
  {
    number: '03',
    title: 'Lee las cartas.',
    detail: 'Cada interesado se presenta con nombre, distrito y tipo de hogar.',
    icon: 'shield',
  },
  {
    number: '04',
    title: 'Elige su familia.',
    detail: 'Respondes por el chat y compartes tu WhatsApp solo si quieres.',
    icon: 'home',
  },
];
