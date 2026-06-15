import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export const EmptyState = ({
  title = '暂无数据',
  description = '当前没有可展示的内容',
  className,
}: EmptyStateProps) => (
  <div
    className={cn('flex min-h-[220px] flex-col items-center justify-center text-center', className)}
  >
    <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-secondary text-muted-foreground">
      <Inbox className="size-5" />
    </div>
    <p className="font-medium text-sm">{title}</p>
    <p className="mt-1 text-muted-foreground text-sm">{description}</p>
  </div>
);
