import { categoryById } from '../data/taxonomy';
import type { CategoryId } from '../domain/types';

const SIZE = {
  sm: 'h-7 w-7 text-sm',
  md: 'h-10 w-10 text-lg',
  lg: 'h-14 w-14 text-2xl',
} as const;

export function CategoryIcon({
  category,
  size = 'md',
  className = '',
}: {
  category: CategoryId;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const meta = categoryById(category);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg ${SIZE[size]} ${className}`}
      style={{ backgroundColor: `${meta?.colour ?? '#64748b'}1a` }}
      aria-hidden="true"
    >
      {meta?.icon ?? '📦'}
    </span>
  );
}

export function categoryColour(category: CategoryId): string {
  return categoryById(category)?.colour ?? '#64748b';
}
