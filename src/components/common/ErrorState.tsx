import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, RotateCcw } from 'lucide-react';

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryText?: string;
  className?: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  title = '加载失败',
  description = '请求数据时出现问题，请稍后重试',
  retryText = '重试',
  className,
  onRetry,
}: ErrorStateProps) => (
  <div
    className={cn('flex min-h-[220px] flex-col items-center justify-center text-center', className)}
  >
    <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
      <AlertCircle className="size-5" />
    </div>
    <p className="font-medium text-sm">{title}</p>
    <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    {onRetry ? (
      <Button className="mt-4" type="button" variant="outline" onClick={onRetry}>
        <RotateCcw className="size-4" />
        {retryText}
      </Button>
    ) : null}
  </div>
);
