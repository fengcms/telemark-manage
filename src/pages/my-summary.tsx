import { getMySummary } from '@/api/calls';
import { getApiErrorMessage } from '@/api/client';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatDurationSeconds, formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock3, PhoneCall, TimerReset, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export const MySummaryPage = () => {
  const summaryQuery = useQuery({
    queryKey: ['my-summary'],
    queryFn: getMySummary,
  });

  const summary = summaryQuery.data;
  const connectRate =
    summary && summary.totalCalls > 0 ? summary.connectedCalls / summary.totalCalls : 0;

  const metrics = useMemo(
    () => [
      {
        label: '今日拨打',
        value: formatNumber(summary?.totalCalls),
        icon: PhoneCall,
        tone: 'text-primary',
      },
      {
        label: '今日接通',
        value: formatNumber(summary?.connectedCalls),
        icon: Activity,
        tone: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: '接通率',
        value: formatPercent(connectRate),
        icon: TrendingUp,
        tone: 'text-accent',
      },
      {
        label: '通话总时长',
        value: formatDurationSeconds(summary?.totalDuration),
        icon: Clock3,
        tone: 'text-sky-600 dark:text-sky-400',
      },
    ],
    [connectRate, summary],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">我的战报</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          查看当前账号今日拨打次数、接通情况和通话时长。
        </p>
      </div>

      {summaryQuery.isLoading ? (
        <LoadingPage text="正在加载我的战报" />
      ) : summaryQuery.isError ? (
        <ErrorState
          description={getApiErrorMessage(summaryQuery.error)}
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(metric => {
              const Icon = metric.icon;

              return (
                <Card key={metric.label}>
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-muted-foreground text-sm">{metric.label}</p>
                      <p className="mt-2 font-semibold text-2xl tracking-normal">{metric.value}</p>
                    </div>
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-md bg-secondary',
                        metric.tone,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>今日拨打节奏</CardTitle>
              <CardDescription>
                时间基准与后端日报一致，按 Asia/Shanghai 业务日期统计。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border bg-background p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <TimerReset className="size-4" />
                    首次拨打
                  </div>
                  <p className="mt-3 font-semibold text-lg tracking-normal">
                    {formatDateTime(summary?.firstCallTime)}
                  </p>
                </div>
                <div className="rounded-md border bg-background p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <TimerReset className="size-4" />
                    最后拨打
                  </div>
                  <p className="mt-3 font-semibold text-lg tracking-normal">
                    {formatDateTime(summary?.lastCallTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
