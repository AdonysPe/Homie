import type { UseFormReturn } from 'react-hook-form';

import type { PublishFormValues } from '../types';

export interface PublishStepProps {
  form: UseFormReturn<PublishFormValues>;
}
