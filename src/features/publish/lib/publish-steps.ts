import type { PublishFieldName } from '../types';

export interface PublishStep {
  id: 'mascota' | 'perfil' | 'salud' | 'fotos' | 'contacto';
  /** Etiqueta corta para la barra de progreso. */
  label: string;
  title: string;
  helper: string;
  /** Campos que se validan al intentar avanzar desde este paso. */
  fields: PublishFieldName[];
}

export const PUBLISH_STEPS: PublishStep[] = [
  {
    id: 'mascota',
    label: 'Mascota',
    title: '¿A quién estás ayudando?',
    helper: 'Empecemos por lo básico.',
    fields: ['species', 'name'],
  },
  {
    id: 'perfil',
    label: 'Perfil',
    title: 'Contanos cómo es',
    helper: 'Esto ayuda a filtrar a los interesados correctos.',
    fields: ['ageValue', 'ageUnit', 'sex', 'size'],
  },
  {
    id: 'salud',
    label: 'Salud',
    title: 'Salud y hogar ideal',
    helper: 'Ser claro desde el principio evita devoluciones.',
    fields: [
      'isSterilized',
      'isVaccinated',
      'isDewormed',
      'hasMicrochip',
      'microchipNumber',
      'specialNeeds',
      'idealHome',
      'goodWithKids',
      'goodWithPets',
    ],
  },
  {
    id: 'fotos',
    label: 'Fotos',
    title: 'Sus mejores fotos',
    helper: 'Una buena foto multiplica las adopciones.',
    fields: ['photos', 'description', 'reason'],
  },
  {
    id: 'contacto',
    label: 'Contacto',
    title: '¿Cómo te avisamos?',
    helper: 'Tus datos quedan ocultos hasta que vos decidas compartirlos.',
    fields: [
      'ownerName',
      'city',
      'contactMethod',
      'contactValue',
      'acceptsFollowUp',
      'acceptsTerms',
    ],
  },
];

export const TOTAL_PUBLISH_STEPS = PUBLISH_STEPS.length;
