import type { PublishFormValues } from '../types';

/**
 * El formulario arranca con las opciones más frecuentes ya elegidas:
 * menos decisiones = menos fricción.
 */
export const PUBLISH_DEFAULT_VALUES: PublishFormValues = {
  species: 'perro',
  name: '',
  ageValue: 2,
  ageUnit: 'anos',
  size: 'mediano',
  sex: 'hembra',
  isSterilized: false,
  isVaccinated: true,
  goodWithKids: true,
  goodWithPets: true,
  photos: [],
  description: '',
  reason: 'mudanza',
  ownerName: '',
  city: '',
  contactMethod: 'whatsapp',
  contactValue: '',
  acceptsFollowUp: false,
};
