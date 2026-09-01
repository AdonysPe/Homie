export interface HowItWorksStep {
  number: string;
  title: string;
  detail: string;
  icon: 'chat' | 'camera' | 'shield' | 'home';
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  { number: '01', title: 'Contanos cómo es', detail: 'Nombre, edad, carácter.', icon: 'chat' },
  { number: '02', title: 'Subí sus fotos', detail: 'Con dos o tres alcanza.', icon: 'camera' },
  { number: '03', title: 'Revisamos todo', detail: 'Publicamos en menos de 24 h.', icon: 'shield' },
  { number: '04', title: 'Elegís su familia', detail: 'Te pasamos los interesados.', icon: 'home' },
];
