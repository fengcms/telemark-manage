import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type LoadingPageProps = {
  text?: string;
  className?: string;
};

export const LoadingPage = ({ text = '加载中', className }: LoadingPageProps) => (
  <div className={cn('flex min-h-[320px] items-center justify-center', className)}>
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 className="size-4 animate-spin" />
      <span>{text}</span>
    </div>
  </div>
);
