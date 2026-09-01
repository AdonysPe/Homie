import type { PublishFieldName } from '../types';

export interface PublishStep {
  id: 'mascota' | 'perfil' | 'fotos' | 'contacto';
  title: string;
  helper: string;
  /** Campos que se validan al intentar avanzar desde este paso. */
  fields: PublishFieldName[];
}

export const PUBLISH_STEPS: PublishStep[] = [
  {
    id: 'mascota',
    title: '¿A quién estás ayudando?',
    helper: 'Empecemos por lo básico.',
    fields: ['species', 'name'],
  },
  {
    id: 'perfil',
    title: 'Contanos cómo es',
    helper: 'Esto ayuda a filtrar a los interesados correctos.',
    fields: ['ageValue', 'ageUnit', 'size', 'sex'],
  },
  {
    id: 'fotos',
    title: 'Sus mejores fotos',
    helper: 'Una buena foto multiplica las adopciones.',
    fields: ['photos', 'description', 'reason'],
  },
  {
    id: 'contacto',
    title: '¿Cómo te contactamos?',
    helper: 'Solo lo compartimos con interesados verificados.',
    fields: ['ownerName', 'city', 'contactMethod', 'contactValue', 'acceptsFollowUp'],
  },
];

export const TOTAL_PUBLISH_STEPS = PUBLISH_STEPS.length;
