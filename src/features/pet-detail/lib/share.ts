import { speciesNoun } from '@/lib/pet-catalog';
import type { PetListing } from '@/types/pet';

type ShareablePet = Pick<PetListing, 'name' | 'species' | 'sex' | 'ageLabel' | 'city'>;

/** "¡Ayúdame a que Luna encuentre hogar! Es una perra de 3 años en Miraflores." */
export function buildShareText(pet: ShareablePet): string {
  return `¡Ayúdame a que ${pet.name} encuentre hogar! Es ${speciesNoun(pet.species, pet.sex)} de ${pet.ageLabel} en ${pet.city}.`;
}

export function buildWhatsAppUrl(pet: ShareablePet, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${buildShareText(pet)} ${url}`)}`;
}

/**
 * Copia texto al portapapeles. Si la API moderna no está disponible
 * (contexto no seguro, navegadores viejos) usa el método clásico.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Sigue con el método clásico.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
