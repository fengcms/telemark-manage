import { getApiErrorMessage } from '@/api/client';
import { getAgentDailyRows, getDashboardOverview } from '@/api/dashboard';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleLabels } from '@/lib/constants';
import { formatDateTime, formatDurationSeconds, formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock3, PhoneCall, Target, TrendingUp, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const pageSize = 10;

export const DashboardPage = () => {
  const [date, setDate] = useState(getToday);
  const [page, setPage] = useState(0);

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview', date],
    queryFn: () => getDashboardOverview({ date }),
  });

  const agentDailyQuery = useQuery({
    queryKey: ['dashboard', 'agent-daily', date, page],
    queryFn: () =>
      getAgentDailyRows({
        date,
        page,
        pagesize: pageSize,
        sort: '-totalCalls',
      }),
  });

  const metrics = useMemo(() => {
    const overview = overviewQuery.data;

    return [
      {
        label: '总拨打',
        value: formatNumber(overview?.totalCalls),
        icon: PhoneCall,
        tone: 'text-primary',
      },
      {
        label: '接通数',
        value: formatNumber(overview?.connectedCalls),
        icon: Activity,
        tone: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: '接通率',
        value: formatPercent(overview?.connectRate),
        icon: TrendingUp,
        tone: 'text-accent',
      },
      {
        label: '总时长',
        value: formatDurationSeconds(overview?.totalDuration),
        icon: Clock3,
        tone: 'text-sky-600 dark:text-sky-400',
      },
      {
        label: '活跃员工',
        value: formatNumber(overview?.activeAgents),
        icon: UsersRound,
        tone: 'text-violet-600 dark:text-violet-400',
      },
      {
        label: '意向客户',
        value: formatNumber(overview?.intentCustomers),
        icon: Target,
        tone: 'text-rose-600 dark:text-rose-400',
      },
    ];
  }, [overviewQuery.data]);

  const total = agentDailyQuery.data?.total ?? 0;
  const agentRows = agentDailyQuery.data?.list ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-normal">Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-sm">查看团队当日拨打、接通和员工排行。</p>
        </div>
        <div className="w-full space-y-2 sm:w-48">
          <Label htmlFor="dashboardDate">统计日期</Label>
          <Input
            id="dashboardDate"
            type="date"
            value={date}
            onChange={event => {
              setDate(event.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {overviewQuery.isLoading ? (
        <LoadingPage className="min-h-[180px]" text="正在加载核心指标" />
      ) : overviewQuery.isError ? (
        <ErrorState
          description={getApiErrorMessage(overviewQuery.error)}
          onRetry={() => void overviewQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>员工日报排行</CardTitle>
            <CardDescription>默认按总拨打次数降序展示。</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>共 {formatNumber(total)} 条</span>
          </div>
        </CardHeader>
        <CardContent>
          {agentDailyQuery.isLoading ? (
            <LoadingPage className="min-h-[260px]" text="正在加载员工日报" />
          ) : agentDailyQuery.isError ? (
            <ErrorState
              description={getApiErrorMessage(agentDailyQuery.error)}
              onRetry={() => void agentDailyQuery.refetch()}
            />
          ) : agentRows.length === 0 ? (
            <EmptyState title="暂无日报数据" description="所选日期还没有员工通话统计。" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">员工</th>
                    <th className="px-3 py-3 text-left font-medium">角色</th>
                    <th className="px-3 py-3 text-right font-medium">总拨打</th>
                    <th className="px-3 py-3 text-right font-medium">接通</th>
                    <th className="px-3 py-3 text-right font-medium">接通率</th>
                    <th className="px-3 py-3 text-right font-medium">总时长</th>
                    <th className="px-3 py-3 text-left font-medium">首次拨打</th>
                    <th className="px-3 py-3 text-left font-medium">最后拨打</th>
                  </tr>
                </thead>
                <tbody>
                  {agentRows.map(row => (
                    <tr className="border-b last:border-0 hover:bg-secondary/45" key={row.userId}>
                      <td className="px-3 py-3">
                        <div className="font-medium">{row.realName || row.username}</div>
                        <div className="text-muted-foreground text-xs">{row.username}</div>
                      </td>
                      <td className="px-3 py-3">{roleLabels[row.role]}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.totalCalls)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.connectedCalls)}</td>
                      <td className="px-3 py-3 text-right">{formatPercent(row.connectRate)}</td>
                      <td className="px-3 py-3 text-right">
                        {formatDurationSeconds(row.totalDuration)}
                      </td>
                      <td className="px-3 py-3">{formatDateTime(row.firstCallTime)}</td>
                      <td className="px-3 py-3">{formatDateTime(row.lastCallTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-muted-foreground text-sm">
              第 {formatNumber(page + 1)} / {formatNumber(totalPages)} 页
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page <= 0 || agentDailyQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => setPage(current => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                disabled={page + 1 >= totalPages || agentDailyQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => setPage(current => current + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
