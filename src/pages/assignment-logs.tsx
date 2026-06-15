import { getApiErrorMessage } from '@/api/client';
import { getAssignmentLogs } from '@/api/logs';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime, formatNumber } from '@/lib/format';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

const pageSize = 20;

const actionLabels: Record<string, string> = {
  assign: '分配',
  reassign: '转移',
  recycle: '回收',
  '1': '分配',
  '2': '转移',
  '3': '回收',
};

type Filters = {
  customerId: string;
  operatorId: string;
  fromUserId: string;
  toUserId: string;
  action: string;
  startDate: string;
  endDate: string;
};

const emptyFilters: Filters = {
  customerId: '',
  operatorId: '',
  fromUserId: '',
  toUserId: '',
  action: '',
  startDate: '',
  endDate: '',
};

const parseNullableId = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed === 'null' ? 'null' : Number(trimmed);
};

export const AssignmentLogsPage = () => {
  const [page, setPage] = useState(0);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const logsQuery = useQuery({
    queryKey: ['assignment-logs', page, filters],
    queryFn: () =>
      getAssignmentLogs({
        page,
        pagesize: pageSize,
        sort: '-id',
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        operatorId: filters.operatorId ? Number(filters.operatorId) : undefined,
        fromUserId: parseNullableId(filters.fromUserId),
        toUserId: parseNullableId(filters.toUserId),
        action: filters.action ? (filters.action as 'assign' | 'reassign' | 'recycle') : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
  });

  const rows = logsQuery.data?.list ?? [];
  const total = logsQuery.data?.total ?? 0;
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
        <h1 className="font-semibold text-2xl tracking-normal">分配日志</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          查询客户线索分配、转移和回收的审计记录。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日志查询</CardTitle>
          <CardDescription>支持客户、操作人、归属变化、动作和日期筛选。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 lg:grid-cols-4" onSubmit={onSubmit}>
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
              <Label htmlFor="operatorId">操作人 ID</Label>
              <Input
                id="operatorId"
                inputMode="numeric"
                value={draftFilters.operatorId}
                onChange={event => updateDraft('operatorId', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromUserId">原归属 ID</Label>
              <Input
                id="fromUserId"
                placeholder="可填 null"
                value={draftFilters.fromUserId}
                onChange={event => updateDraft('fromUserId', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toUserId">新归属 ID</Label>
              <Input
                id="toUserId"
                placeholder="可填 null"
                value={draftFilters.toUserId}
                onChange={event => updateDraft('toUserId', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">动作</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="action"
                value={draftFilters.action}
                onChange={event => updateDraft('action', event.target.value)}
              >
                <option value="">全部</option>
                <option value="assign">分配</option>
                <option value="reassign">转移</option>
                <option value="recycle">回收</option>
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

          {logsQuery.isLoading ? (
            <LoadingPage className="min-h-[320px]" text="正在加载分配日志" />
          ) : logsQuery.isError ? (
            <ErrorState
              description={getApiErrorMessage(logsQuery.error)}
              onRetry={() => void logsQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <EmptyState title="暂无日志" description="当前筛选条件下没有分配审计记录。" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">客户</th>
                    <th className="px-3 py-3 text-left font-medium">动作</th>
                    <th className="px-3 py-3 text-left font-medium">原归属</th>
                    <th className="px-3 py-3 text-left font-medium">新归属</th>
                    <th className="px-3 py-3 text-left font-medium">操作人</th>
                    <th className="px-3 py-3 text-left font-medium">原因</th>
                    <th className="px-3 py-3 text-left font-medium">时间</th>
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
                      <td className="px-3 py-3">{actionLabels[row.action] ?? row.action}</td>
                      <td className="px-3 py-3">{row.fromUserName || '公海'}</td>
                      <td className="px-3 py-3">{row.toUserName || '公海'}</td>
                      <td className="px-3 py-3">{row.operatorName || row.operatorId}</td>
                      <td className="px-3 py-3">{row.reason || '-'}</td>
                      <td className="px-3 py-3">{formatDateTime(row.createdAt)}</td>
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
                disabled={page <= 0 || logsQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => setPage(current => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                disabled={page + 1 >= totalPages || logsQuery.isFetching}
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
