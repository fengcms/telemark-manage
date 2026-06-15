import { cn } from '@/lib/utils';
import type { LabelHTMLAttributes } from 'react';

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is forwarded through props.
  <label className={cn('font-medium text-sm leading-none', className)} {...props} />
);
