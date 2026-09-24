import type { ListingStatus } from '@/types/pet';

interface StatusPresentation {
  label: string;
  tone: 'clay' | 'sage' | 'honey' | 'neutral';
}

const STATUS_PRESENTATION: Record<ListingStatus, StatusPresentation> = {
  'en-revision': { label: 'En revisión', tone: 'honey' },
  publicada: { label: 'Publicada', tone: 'neutral' },
  'con-interesados': { label: 'Con interesados', tone: 'clay' },
  adoptada: { label: 'Adoptada', tone: 'sage' },
  pausada: { label: 'Pausada', tone: 'neutral' },
};

export const statusPresentation = (status: ListingStatus): StatusPresentation =>
  STATUS_PRESENTATION[status];
