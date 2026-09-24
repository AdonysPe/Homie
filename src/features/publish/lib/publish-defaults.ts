import type { PublishFormValues } from '../types';

/**
 * El formulario arranca con las opciones más frecuentes ya elegidas:
 * menos decisiones = menos fricción. Los consentimientos, en cambio,
 * siempre arrancan sin marcar: tienen que ser una decisión explícita.
 */
export const PUBLISH_DEFAULT_VALUES: PublishFormValues = {
  species: 'perro',
  name: '',
  ageValue: 2,
  ageUnit: 'anos',
  sex: 'hembra',
  size: 'mediano',
  isSterilized: false,
  isVaccinated: true,
  isDewormed: true,
  hasMicrochip: false,
  microchipNumber: '',
  specialNeeds: '',
  idealHome: 'departamento',
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
  acceptsTerms: false,
};
