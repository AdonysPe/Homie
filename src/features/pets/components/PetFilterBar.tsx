'use client';

import { motion } from 'framer-motion';

import { SpeciesIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { speciesPlural } from '@/lib/pet-catalog';
import type { PetSpecies } from '@/types/pet';
import type { SpeciesFilter } from '../hooks/usePetFilter';

interface PetFilterBarProps {
  options: { value: SpeciesFilter; count: number }[];
  activeFilter: SpeciesFilter;
  onChange: (filter: SpeciesFilter) => void;
}

export function PetFilterBar({ options, activeFilter, onChange }: PetFilterBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por tipo de mascota"
      className="scrollbar-none -mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((option) => {
        const isActive = option.value === activeFilter;
        const label = option.value === 'todas' ? 'Todas' : speciesPlural(option.value as PetSpecies);

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition-colors duration-200',
              isActive ? 'text-white' : 'text-ink-700 hover:bg-cream-200',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="pet-filter-pill"
                className="absolute inset-0 rounded-pill bg-clay-500"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              {option.value !== 'todas' ? (
                <SpeciesIcon species={option.value as PetSpecies} size={17} />
              ) : null}
              {label}
              <span className={cn('tabular-nums', isActive ? 'text-white/70' : 'text-ink-300')}>
                {option.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
