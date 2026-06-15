import { getApiErrorMessage } from '@/api/client';
import { getMyCustomerHistory } from '@/api/customers';
import type { CustomerStatus, CustomerType } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerStatusLabels, customerTypeLabels } from '@/lib/constants';
import { formatDateTime, formatNumber } from '@/lib/format';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

const pageSize = 10;
const statusOptions: Exclude<CustomerStatus, 0>[] = [1, 2, 3, 4];
const typeOptions: CustomerType[] = [0, 1];

type Filters = {
  nameLike: string;
  phoneLike: string;
  companyLike: string;
  status: string;
  type: string;
};

const emptyFilters: Filters = {
  nameLike: '',
  phoneLike: '',
  companyLike: '',
  status: '',
  type: '',
};

export const MyCustomersHistoryPage = () => {
  const [page, setPage] = useState(0);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const historyQuery = useQuery({
    queryKey: ['my-customers-history', page, filters],
    queryFn: () =>
      getMyCustomerHistory({
        page,
        pagesize: pageSize,
        sort: '-updatedAt',
        status: filters.status ? (Number(filters.status) as Exclude<CustomerStatus, 0>) : undefined,
        type: filters.type ? (Number(filters.type) as CustomerType) : undefined,
        'name-like': filters.nameLike || undefined,
        'phone-like': filters.phoneLike || undefined,
        'company-like': filters.companyLike || undefined,
      }),
  });

  const rows = historyQuery.data?.list ?? [];
  const total = historyQuery.data?.total ?? 0;
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
        <h1 className="font-semibold text-2xl tracking-normal">历史客户</h1>
        <p className="mt-1 text-muted-foreground text-sm">查看当前账号名下已经拨打过的客户记录。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>历史客户列表</CardTitle>
          <CardDescription>仅查询当前登录用户自己的历史客户。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_160px_160px_auto]"
            onSubmit={onSubmit}
          >
            <Input
              placeholder="客户名称"
              value={draftFilters.nameLike}
              onChange={event => updateDraft('nameLike', event.target.value)}
            />
            <Input
              placeholder="手机号"
              value={draftFilters.phoneLike}
              onChange={event => updateDraft('phoneLike', event.target.value)}
            />
            <Input
              placeholder="公司"
              value={draftFilters.companyLike}
              onChange={event => updateDraft('companyLike', event.target.value)}
            />
            <div className="space-y-2 lg:space-y-0">
              <Label className="sr-only" htmlFor="historyStatus">
                状态
              </Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="historyStatus"
                value={draftFilters.status}
                onChange={event => updateDraft('status', event.target.value)}
              >
                <option value="">全部状态</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {customerStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 lg:space-y-0">
              <Label className="sr-only" htmlFor="historyType">
                类型
              </Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="historyType"
                value={draftFilters.type}
                onChange={event => updateDraft('type', event.target.value)}
              >
                <option value="">全部类型</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>
                    {customerTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              查询
            </Button>
          </form>

          {historyQuery.isLoading ? (
            <LoadingPage className="min-h-[320px]" text="正在加载历史客户" />
          ) : historyQuery.isError ? (
            <ErrorState
              description={getApiErrorMessage(historyQuery.error)}
              onRetry={() => void historyQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <EmptyState title="暂无历史客户" description="拨打过的客户会出现在这里。" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">客户</th>
                    <th className="px-3 py-3 text-left font-medium">电话</th>
                    <th className="px-3 py-3 text-left font-medium">公司</th>
                    <th className="px-3 py-3 text-left font-medium">状态</th>
                    <th className="px-3 py-3 text-left font-medium">类型</th>
                    <th className="px-3 py-3 text-left font-medium">备注</th>
                    <th className="px-3 py-3 text-left font-medium">更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr className="border-b last:border-0 hover:bg-secondary/45" key={row.id}>
                      <td className="px-3 py-3 font-medium">{row.name || '-'}</td>
                      <td className="px-3 py-3">{row.phone}</td>
                      <td className="px-3 py-3">{row.company || '-'}</td>
                      <td className="px-3 py-3">{customerStatusLabels[row.status]}</td>
                      <td className="px-3 py-3">{customerTypeLabels[row.type]}</td>
                      <td className="max-w-80 truncate px-3 py-3">{row.remark || '-'}</td>
                      <td className="px-3 py-3">{formatDateTime(row.updatedAt)}</td>
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
                disabled={page <= 0 || historyQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => setPage(current => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                disabled={page + 1 >= totalPages || historyQuery.isFetching}
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
