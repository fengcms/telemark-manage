import { reportCall } from '@/api/calls';
import { getApiErrorMessage } from '@/api/client';
import { getMyCustomers } from '@/api/customers';
import type { Customer, CustomerStatus } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerStatusLabels, customerTypeLabels } from '@/lib/constants';
import { formatDateTime, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PhoneCall, Search } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

const pageSize = 10;
const reportStatusOptions: Exclude<CustomerStatus, 0>[] = [1, 2, 3, 4];

type Filters = {
  nameLike: string;
  phoneLike: string;
  companyLike: string;
};

const emptyFilters: Filters = {
  nameLike: '',
  phoneLike: '',
  companyLike: '',
};

const toLocalInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toIsoString = (value: string) => (value ? new Date(value).toISOString() : undefined);

const makeClientRequestId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const MyCustomersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [duration, setDuration] = useState('0');
  const [callResult, setCallResult] = useState<Exclude<CustomerStatus, 0>>(1);
  const [callRemark, setCallRemark] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');

  const customersQuery = useQuery({
    queryKey: ['my-customers', page, filters],
    queryFn: () =>
      getMyCustomers({
        page,
        pagesize: pageSize,
        sort: '-id',
        'name-like': filters.nameLike || undefined,
        'phone-like': filters.phoneLike || undefined,
        'company-like': filters.companyLike || undefined,
      }),
  });

  const reportMutation = useMutation({
    mutationFn: () => {
      if (!activeCustomer) {
        throw new Error('请先选择客户');
      }

      return reportCall({
        customerId: activeCustomer.id,
        duration: Math.max(0, Number(duration) || 0),
        callResult,
        callRemark: callRemark.trim() || undefined,
        clientRequestId: makeClientRequestId(),
        startedAt: toIsoString(startedAt),
        endedAt: toIsoString(endedAt),
      });
    },
    onSuccess: () => {
      setActiveCustomer(null);
      setDuration('0');
      setCallResult(1);
      setCallRemark('');
      setStartedAt('');
      setEndedAt('');
      void queryClient.invalidateQueries({ queryKey: ['my-customers'] });
      void queryClient.invalidateQueries({ queryKey: ['my-customers-history'] });
      void queryClient.invalidateQueries({ queryKey: ['my-summary'] });
    },
  });

  const rows = customersQuery.data?.list ?? [];
  const total = customersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const selectedMeta = useMemo(() => {
    if (!activeCustomer) {
      return null;
    }

    return [
      ['电话', activeCustomer.phone],
      ['公司', activeCustomer.company || '-'],
      ['类型', customerTypeLabels[activeCustomer.type]],
      ['创建时间', formatDateTime(activeCustomer.createdAt)],
    ];
  }, [activeCustomer]);

  const updateDraft = (key: keyof Filters, value: string) => {
    setDraftFilters(current => ({ ...current, [key]: value }));
  };

  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setFilters(draftFilters);
  };

  const onReportSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reportMutation.mutate();
  };

  const useCurrentTimeRange = () => {
    const end = new Date();
    const start = new Date(end.getTime() - Math.max(0, Number(duration) || 0) * 1000);

    setStartedAt(toLocalInputValue(start));
    setEndedAt(toLocalInputValue(end));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">我的客户</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          处理当前分配给你的未拨打客户，并回传通话结果。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>待拨打客户</CardTitle>
              <CardDescription>后端会强制只返回当前账号名下未拨打客户。</CardDescription>
            </div>
            <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={onFilterSubmit}>
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
              <Button type="submit" variant="outline">
                <Search className="size-4" />
                查询
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-4">
            {customersQuery.isLoading ? (
              <LoadingPage className="min-h-[320px]" text="正在加载我的客户" />
            ) : customersQuery.isError ? (
              <ErrorState
                description={getApiErrorMessage(customersQuery.error)}
                onRetry={() => void customersQuery.refetch()}
              />
            ) : rows.length === 0 ? (
              <EmptyState title="暂无待拨打客户" description="当前没有分配给你的未拨打客户。" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="px-3 py-3 text-left font-medium">客户</th>
                      <th className="px-3 py-3 text-left font-medium">电话</th>
                      <th className="px-3 py-3 text-left font-medium">公司</th>
                      <th className="px-3 py-3 text-left font-medium">类型</th>
                      <th className="px-3 py-3 text-left font-medium">更新时间</th>
                      <th className="px-3 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(customer => (
                      <tr
                        className={cn(
                          'border-b last:border-0 hover:bg-secondary/45',
                          activeCustomer?.id === customer.id && 'bg-secondary',
                        )}
                        key={customer.id}
                      >
                        <td className="px-3 py-3 font-medium">{customer.name || '-'}</td>
                        <td className="px-3 py-3">{customer.phone}</td>
                        <td className="px-3 py-3">{customer.company || '-'}</td>
                        <td className="px-3 py-3">{customerTypeLabels[customer.type]}</td>
                        <td className="px-3 py-3">{formatDateTime(customer.updatedAt)}</td>
                        <td className="px-3 py-3 text-right">
                          <Button
                            size="sm"
                            type="button"
                            variant={activeCustomer?.id === customer.id ? 'secondary' : 'outline'}
                            onClick={() => setActiveCustomer(customer)}
                          >
                            上报
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
              <p className="text-muted-foreground text-sm">
                第 {formatNumber(page + 1)} / {formatNumber(totalPages)} 页，共{' '}
                {formatNumber(total)} 条
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 0 || customersQuery.isFetching}
                  type="button"
                  variant="outline"
                  onClick={() => setPage(current => Math.max(0, current - 1))}
                >
                  上一页
                </Button>
                <Button
                  disabled={page + 1 >= totalPages || customersQuery.isFetching}
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

        <Card>
          <CardHeader>
            <CardTitle>通话上报</CardTitle>
            <CardDescription>提交后客户会从待拨打列表移入历史客户。</CardDescription>
          </CardHeader>
          <CardContent>
            {!activeCustomer ? (
              <EmptyState title="未选择客户" description="点击左侧列表中的上报按钮。" />
            ) : (
              <form className="space-y-4" onSubmit={onReportSubmit}>
                <div className="rounded-md border bg-background p-4 text-sm">
                  <div className="font-medium">{activeCustomer.name || '未命名客户'}</div>
                  <div className="mt-1 text-muted-foreground">{activeCustomer.phone}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                    {selectedMeta?.map(([label, value]) => (
                      <span key={label}>
                        {label}：{value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="duration">通话时长（秒）</Label>
                    <Input
                      id="duration"
                      min="0"
                      step="1"
                      type="number"
                      value={duration}
                      onChange={event => setDuration(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callResult">通话结果</Label>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      id="callResult"
                      value={callResult}
                      onChange={event =>
                        setCallResult(Number(event.target.value) as Exclude<CustomerStatus, 0>)
                      }
                    >
                      {reportStatusOptions.map(status => (
                        <option key={status} value={status}>
                          {customerStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="startedAt">开始时间</Label>
                    <Input
                      id="startedAt"
                      type="datetime-local"
                      value={startedAt}
                      onChange={event => setStartedAt(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endedAt">结束时间</Label>
                    <Input
                      id="endedAt"
                      type="datetime-local"
                      value={endedAt}
                      onChange={event => setEndedAt(event.target.value)}
                    />
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={useCurrentTimeRange}>
                  使用当前时间
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="callRemark">通话备注</Label>
                  <textarea
                    className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="callRemark"
                    value={callRemark}
                    onChange={event => setCallRemark(event.target.value)}
                  />
                </div>

                {reportMutation.isError ? (
                  <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                    {getApiErrorMessage(reportMutation.error)}
                  </p>
                ) : null}
                {reportMutation.isSuccess ? (
                  <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-primary text-sm">
                    已上报，日报日期 {reportMutation.data.date}
                    {reportMutation.data.idempotent ? '，本次为重复请求' : ''}。
                  </p>
                ) : null}

                <Button className="w-full" disabled={reportMutation.isPending} type="submit">
                  {reportMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PhoneCall className="size-4" />
                  )}
                  提交通话结果
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
