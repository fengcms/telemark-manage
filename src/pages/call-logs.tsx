import { getCallLogs } from '@/api/calls';
import { getApiErrorMessage } from '@/api/client';
import type { CustomerStatus } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerStatusLabels } from '@/lib/constants';
import { formatDateTime, formatDurationSeconds, formatNumber } from '@/lib/format';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

const pageSize = 20;
const statusOptions: CustomerStatus[] = [0, 1, 2, 3, 4];

type Filters = {
  userId: string;
  customerId: string;
  callResult: string;
  startDate: string;
  endDate: string;
};

const emptyFilters: Filters = {
  userId: '',
  customerId: '',
  callResult: '',
  startDate: '',
  endDate: '',
};

export const CallLogsPage = () => {
  const [page, setPage] = useState(0);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const callLogsQuery = useQuery({
    queryKey: ['call-logs', page, filters],
    queryFn: () =>
      getCallLogs({
        page,
        pagesize: pageSize,
        sort: '-id',
        userId: filters.userId ? Number(filters.userId) : undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        callResult: filters.callResult ? (Number(filters.callResult) as CustomerStatus) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
  });

  const rows = callLogsQuery.data?.list ?? [];
  const total = callLogsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateDraft = (key: keyof Filters, value: string) => {
    setDraftFilters(current => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setFilters(draftFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">通话日志</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          查询员工通话明细、通话结果、时长和幂等请求标识。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>通话明细</CardTitle>
          <CardDescription>支持员工、客户、通话结果和日期筛选。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 lg:grid-cols-[1fr_1fr_180px_180px_180px_auto]"
            onSubmit={onSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="userId">员工 ID</Label>
              <Input
                id="userId"
                inputMode="numeric"
                value={draftFilters.userId}
                onChange={event => updateDraft('userId', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">客户 ID</Label>
              <Input
                id="customerId"
                inputMode="numeric"
                value={draftFilters.customerId}
                onChange={event => updateDraft('customerId', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callResult">通话结果</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="callResult"
                value={draftFilters.callResult}
                onChange={event => updateDraft('callResult', event.target.value)}
              >
                <option value="">全部</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {customerStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={draftFilters.startDate}
                onChange={event => updateDraft('startDate', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={draftFilters.endDate}
                onChange={event => updateDraft('endDate', event.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button className="flex-1" type="submit" variant="outline">
                <Search className="size-4" />
                查询
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDraftFilters(emptyFilters);
                  setFilters(emptyFilters);
                  setPage(0);
                }}
              >
                重置
              </Button>
            </div>
          </form>

          {callLogsQuery.isLoading ? (
            <LoadingPage className="min-h-[320px]" text="正在加载通话日志" />
          ) : callLogsQuery.isError ? (
            <ErrorState
              description={getApiErrorMessage(callLogsQuery.error)}
              onRetry={() => void callLogsQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <EmptyState title="暂无通话日志" description="当前筛选条件下没有通话记录。" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">客户</th>
                    <th className="px-3 py-3 text-left font-medium">员工</th>
                    <th className="px-3 py-3 text-left font-medium">结果</th>
                    <th className="px-3 py-3 text-right font-medium">时长</th>
                    <th className="px-3 py-3 text-left font-medium">备注</th>
                    <th className="px-3 py-3 text-left font-medium">开始</th>
                    <th className="px-3 py-3 text-left font-medium">结束</th>
                    <th className="px-3 py-3 text-left font-medium">创建时间</th>
                    <th className="px-3 py-3 text-left font-medium">请求 ID</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr className="border-b last:border-0 hover:bg-secondary/45" key={row.id}>
                      <td className="px-3 py-3">
                        <div className="font-medium">
                          {row.customerName || `#${row.customerId}`}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {row.customerPhone || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">
                          {row.userRealName || row.username || `#${row.userId}`}
                        </div>
                        <div className="text-muted-foreground text-xs">{row.username || '-'}</div>
                      </td>
                      <td className="px-3 py-3">{customerStatusLabels[row.callResult]}</td>
                      <td className="px-3 py-3 text-right">
                        {formatDurationSeconds(row.duration)}
                      </td>
                      <td className="max-w-56 truncate px-3 py-3">{row.callRemark || '-'}</td>
                      <td className="px-3 py-3">{formatDateTime(row.startedAt)}</td>
                      <td className="px-3 py-3">{formatDateTime(row.endedAt)}</td>
                      <td className="px-3 py-3">{formatDateTime(row.createdAt)}</td>
                      <td className="max-w-48 truncate px-3 py-3 text-muted-foreground">
                        {row.clientRequestId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground text-sm">
              第 {formatNumber(page + 1)} / {formatNumber(totalPages)} 页，共 {formatNumber(total)}{' '}
              条
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page <= 0 || callLogsQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => setPage(current => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                disabled={page + 1 >= totalPages || callLogsQuery.isFetching}
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
