import { getBatchSummary, getBatches, importBatch } from '@/api/batches';
import { getApiErrorMessage } from '@/api/client';
import type { ImportBatchPayload } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime, formatNumber, formatPercent } from '@/lib/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileUp, Loader2, Search, UploadCloud } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';

const pageSize = 10;

const parseCustomerRows = (text: string): ImportBatchPayload['customers'] =>
  text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [phone = '', name = '', company = ''] = line.split(',').map(item => item.trim());

      return { phone, name, company };
    })
    .filter(customer => customer.phone && customer.phone.toLowerCase() !== 'phone');

export const BatchesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [nameLike, setNameLike] = useState('');
  const [sourceLike, setSourceLike] = useState('');
  const [filters, setFilters] = useState({ nameLike: '', sourceLike: '' });
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchName, setBatchName] = useState('');
  const [source, setSource] = useState('');
  const [cost, setCost] = useState('');
  const [rawCustomers, setRawCustomers] = useState('');

  const batchesQuery = useQuery({
    queryKey: ['batches', page, filters],
    queryFn: () =>
      getBatches({
        page,
        pagesize: pageSize,
        sort: '-id',
        'name-like': filters.nameLike || undefined,
        'source-like': filters.sourceLike || undefined,
      }),
  });

  const summaryQuery = useQuery({
    queryKey: ['batches', selectedBatchId, 'summary'],
    queryFn: () => getBatchSummary(selectedBatchId ?? 0),
    enabled: selectedBatchId !== null,
  });

  const previewCustomers = useMemo(() => parseCustomerRows(rawCustomers), [rawCustomers]);

  const importMutation = useMutation({
    mutationFn: () => {
      const customers = parseCustomerRows(rawCustomers);

      if (!batchName.trim()) {
        throw new Error('请输入批次名称');
      }

      if (customers.length === 0) {
        throw new Error('请至少提供一条包含手机号的线索');
      }

      return importBatch({
        name: batchName.trim(),
        source: source.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
        customers,
      });
    },
    onSuccess: data => {
      setBatchName('');
      setSource('');
      setCost('');
      setRawCustomers('');
      setPage(0);
      setSelectedBatchId(data.batchId);
      void queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const total = batchesQuery.data?.total ?? 0;
  const rows = batchesQuery.data?.list ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setFilters({
      nameLike: nameLike.trim(),
      sourceLike: sourceLike.trim(),
    });
  };

  const onImportSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    importMutation.mutate();
  };

  const onCsvFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setRawCustomers(await file.text());
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">批次管理</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          导入线索批次，查看历史批次和单批次质量概览。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>导入线索</CardTitle>
            <CardDescription>粘贴或上传 CSV 内容，列顺序为 phone,name,company。</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onImportSubmit}>
              <div className="space-y-2">
                <Label htmlFor="batchName">批次名称</Label>
                <Input
                  id="batchName"
                  value={batchName}
                  onChange={event => setBatchName(event.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="batchSource">数据来源</Label>
                  <Input
                    id="batchSource"
                    value={source}
                    onChange={event => setSource(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchCost">成本</Label>
                  <Input
                    id="batchCost"
                    min="0"
                    step="0.01"
                    type="number"
                    value={cost}
                    onChange={event => setCost(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerRows">线索数据</Label>
                <textarea
                  className="min-h-36 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  id="customerRows"
                  placeholder={'phone,name,company\n13900020001,客户A,测试公司A'}
                  value={rawCustomers}
                  onChange={event => setRawCustomers(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm hover:bg-secondary">
                  <FileUp className="size-4" />
                  选择 CSV
                  <input
                    accept=".csv,text/csv"
                    className="hidden"
                    type="file"
                    onChange={onCsvFileChange}
                  />
                </label>
                <span className="text-muted-foreground text-sm">
                  已识别 {formatNumber(previewCustomers.length)} 条
                </span>
              </div>
              {importMutation.isError ? (
                <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                  {getApiErrorMessage(importMutation.error)}
                </p>
              ) : null}
              {importMutation.isSuccess ? (
                <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-primary text-sm">
                  已导入 {formatNumber(importMutation.data.importedCount)} 条，跳过重复{' '}
                  {formatNumber(importMutation.data.skippedDuplicateCount)} 条。
                </p>
              ) : null}
              <Button
                className="w-full"
                disabled={importMutation.isPending || !batchName || previewCustomers.length === 0}
                type="submit"
              >
                {importMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                导入批次
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>批次列表</CardTitle>
              <CardDescription>默认按最新导入排序。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={onFilterSubmit}>
                <Input
                  placeholder="批次名称"
                  value={nameLike}
                  onChange={event => setNameLike(event.target.value)}
                />
                <Input
                  placeholder="数据来源"
                  value={sourceLike}
                  onChange={event => setSourceLike(event.target.value)}
                />
                <Button type="submit" variant="outline">
                  <Search className="size-4" />
                  查询
                </Button>
              </form>

              {batchesQuery.isLoading ? (
                <LoadingPage className="min-h-[260px]" text="正在加载批次" />
              ) : batchesQuery.isError ? (
                <ErrorState
                  description={getApiErrorMessage(batchesQuery.error)}
                  onRetry={() => void batchesQuery.refetch()}
                />
              ) : rows.length === 0 ? (
                <EmptyState title="暂无批次" description="导入线索后会在这里看到批次记录。" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="px-3 py-3 text-left font-medium">批次</th>
                        <th className="px-3 py-3 text-left font-medium">来源</th>
                        <th className="px-3 py-3 text-right font-medium">成本</th>
                        <th className="px-3 py-3 text-left font-medium">创建人</th>
                        <th className="px-3 py-3 text-left font-medium">创建时间</th>
                        <th className="px-3 py-3 text-right font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(batch => (
                        <tr className="border-b last:border-0 hover:bg-secondary/45" key={batch.id}>
                          <td className="px-3 py-3 font-medium">{batch.name}</td>
                          <td className="px-3 py-3">{batch.source || '-'}</td>
                          <td className="px-3 py-3 text-right">{formatNumber(batch.cost ?? 0)}</td>
                          <td className="px-3 py-3">{batch.creatorName || batch.creatorId}</td>
                          <td className="px-3 py-3">{formatDateTime(batch.createdAt)}</td>
                          <td className="px-3 py-3 text-right">
                            <Button
                              size="sm"
                              type="button"
                              variant={selectedBatchId === batch.id ? 'secondary' : 'outline'}
                              onClick={() => setSelectedBatchId(batch.id)}
                            >
                              Summary
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  第 {formatNumber(page + 1)} / {formatNumber(totalPages)} 页，共{' '}
                  {formatNumber(total)} 条
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={page <= 0 || batchesQuery.isFetching}
                    type="button"
                    variant="outline"
                    onClick={() => setPage(current => Math.max(0, current - 1))}
                  >
                    上一页
                  </Button>
                  <Button
                    disabled={page + 1 >= totalPages || batchesQuery.isFetching}
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
              <CardTitle>批次 Summary</CardTitle>
              <CardDescription>选择一个批次查看线索质量和成本效果。</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedBatchId ? (
                <EmptyState title="未选择批次" description="点击列表中的 Summary 查看详情。" />
              ) : summaryQuery.isLoading ? (
                <LoadingPage className="min-h-[220px]" text="正在加载批次 Summary" />
              ) : summaryQuery.isError ? (
                <ErrorState
                  description={getApiErrorMessage(summaryQuery.error)}
                  onRetry={() => void summaryQuery.refetch()}
                />
              ) : summaryQuery.data ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['总线索', formatNumber(summaryQuery.data.totalCustomers)],
                    ['已分配', formatNumber(summaryQuery.data.assignedCustomers)],
                    ['未分配', formatNumber(summaryQuery.data.unassignedCustomers)],
                    ['已拨打', formatNumber(summaryQuery.data.calledCustomers)],
                    ['已接通', formatNumber(summaryQuery.data.connectedCustomers)],
                    ['意向客户', formatNumber(summaryQuery.data.intentCustomers)],
                    ['接通率', formatPercent(summaryQuery.data.connectRate)],
                    ['单意向成本', formatNumber(summaryQuery.data.costPerIntent)],
                  ].map(([label, value]) => (
                    <div className="rounded-md border bg-background p-4" key={label}>
                      <p className="text-muted-foreground text-sm">{label}</p>
                      <p className="mt-2 font-semibold text-xl tracking-normal">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
