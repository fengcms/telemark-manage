import {
  createCommonCallRemark,
  deleteCommonCallRemark,
  getCommonCallRemarks,
  updateCommonCallRemark,
} from '@/api/call-remarks';
import { getApiErrorMessage } from '@/api/client';
import type { CommonCallRemark } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime, formatNumber } from '@/lib/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquarePlus, Pencil, Search, Trash2, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';

const pageSize = 10;

type RemarkForm = {
  content: string;
  sortOrder: string;
  status: '0' | '1';
};

const emptyForm: RemarkForm = {
  content: '',
  sortOrder: '10',
  status: '1',
};

export const CommonCallRemarksPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [contentLike, setContentLike] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('sortOrder');
  const [filters, setFilters] = useState({ contentLike: '', status: '', sort: 'sortOrder' });
  const [editingRemark, setEditingRemark] = useState<CommonCallRemark | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<RemarkForm>(emptyForm);
  const [deletingRemark, setDeletingRemark] = useState<CommonCallRemark | null>(null);

  const remarksQuery = useQuery({
    queryKey: ['common-call-remarks', 'admin', page, filters],
    queryFn: () =>
      getCommonCallRemarks({
        page,
        pagesize: pageSize,
        sort: filters.sort,
        'content-like': filters.contentLike || undefined,
        status: filters.status ? Number(filters.status) : undefined,
      }),
  });

  const invalidateRemarks = () => {
    void queryClient.invalidateQueries({ queryKey: ['common-call-remarks', 'admin'] });
    void queryClient.invalidateQueries({ queryKey: ['common-call-remarks', 'active'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const content = form.content.trim();

      if (!content) {
        throw new Error('请输入备注内容');
      }

      const payload = {
        content,
        sortOrder: Number(form.sortOrder) || 0,
        status: Number(form.status),
      };

      if (editingRemark) {
        await updateCommonCallRemark(editingRemark.id, payload);
        return;
      }

      await createCommonCallRemark(payload);
    },
    onSuccess: () => {
      setFormOpen(false);
      setEditingRemark(null);
      setForm(emptyForm);
      invalidateRemarks();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: number }) =>
      updateCommonCallRemark(id, { status: nextStatus }),
    onSuccess: invalidateRemarks,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCommonCallRemark(id),
    onSuccess: () => {
      setDeletingRemark(null);
      invalidateRemarks();
    },
  });

  const rows = remarksQuery.data?.list ?? [];
  const total = remarksQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openCreateForm = () => {
    setEditingRemark(null);
    setForm(emptyForm);
    setFormOpen(true);
    saveMutation.reset();
  };

  const openEditForm = (remark: CommonCallRemark) => {
    setEditingRemark(remark);
    setForm({
      content: remark.content,
      sortOrder: String(remark.sortOrder),
      status: remark.status === 1 ? '1' : '0',
    });
    setFormOpen(true);
    saveMutation.reset();
  };

  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setFilters({ contentLike: contentLike.trim(), status, sort });
  };

  const onSaveSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-normal">快捷备注</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            配置员工通话反馈时可快速选择的常用备注。
          </p>
        </div>
        <Button type="button" onClick={openCreateForm}>
          <MessageSquarePlus className="size-4" />
          新增备注
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>备注配置</CardTitle>
          <CardDescription>启用的备注会按排序值展示在员工通话上报页面。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 md:grid-cols-[1fr_160px_180px_auto]"
            onSubmit={onFilterSubmit}
          >
            <Input
              placeholder="搜索备注内容"
              value={contentLike}
              onChange={event => setContentLike(event.target.value)}
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={event => setStatus(event.target.value)}
            >
              <option value="">全部状态</option>
              <option value="1">启用</option>
              <option value="0">停用</option>
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sort}
              onChange={event => setSort(event.target.value)}
            >
              <option value="sortOrder">排序值升序</option>
              <option value="-sortOrder">排序值降序</option>
              <option value="-id">最新创建</option>
            </select>
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              查询
            </Button>
          </form>

          {remarksQuery.isLoading ? (
            <LoadingPage className="min-h-[320px]" text="正在加载快捷备注" />
          ) : remarksQuery.isError ? (
            <ErrorState
              description={getApiErrorMessage(remarksQuery.error)}
              onRetry={() => void remarksQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <EmptyState title="暂无快捷备注" description="新增备注后会显示在这里。" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">备注内容</th>
                    <th className="px-3 py-3 text-right font-medium">排序值</th>
                    <th className="px-3 py-3 text-left font-medium">状态</th>
                    <th className="px-3 py-3 text-right font-medium">使用次数</th>
                    <th className="px-3 py-3 text-left font-medium">更新时间</th>
                    <th className="px-3 py-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(remark => (
                    <tr className="border-b last:border-0 hover:bg-secondary/45" key={remark.id}>
                      <td className="px-3 py-3 font-medium">{remark.content}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(remark.sortOrder)}</td>
                      <td className="px-3 py-3">{remark.status === 1 ? '启用' : '停用'}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(remark.usageCount)}</td>
                      <td className="px-3 py-3">{formatDateTime(remark.updatedAt)}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => openEditForm(remark)}
                          >
                            <Pencil className="size-4" />
                            编辑
                          </Button>
                          <Button
                            disabled={statusMutation.isPending}
                            size="sm"
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              statusMutation.mutate({
                                id: remark.id,
                                nextStatus: remark.status === 1 ? 0 : 1,
                              })
                            }
                          >
                            {remark.status === 1 ? '停用' : '启用'}
                          </Button>
                          <Button
                            disabled={remark.status === 0}
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => setDeletingRemark(remark)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {statusMutation.isError ? (
            <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {getApiErrorMessage(statusMutation.error)}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground text-sm">
              第 {formatNumber(page + 1)} / {formatNumber(totalPages)} 页，共 {formatNumber(total)}{' '}
              条
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page <= 0 || remarksQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => setPage(current => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                disabled={page + 1 >= totalPages || remarksQuery.isFetching}
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

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold text-lg tracking-normal">
                  {editingRemark ? '编辑快捷备注' : '新增快捷备注'}
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">备注内容会展示给经理和员工。</p>
              </div>
              <Button size="icon" type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <form className="space-y-4 p-5" onSubmit={onSaveSubmit}>
              <div className="space-y-2">
                <Label htmlFor="remarkContent">备注内容</Label>
                <textarea
                  className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="remarkContent"
                  value={form.content}
                  onChange={event =>
                    setForm(current => ({ ...current, content: event.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="remarkSortOrder">排序值</Label>
                  <Input
                    id="remarkSortOrder"
                    step="1"
                    type="number"
                    value={form.sortOrder}
                    onChange={event =>
                      setForm(current => ({ ...current, sortOrder: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarkStatus">状态</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="remarkStatus"
                    value={form.status}
                    onChange={event =>
                      setForm(current => ({ ...current, status: event.target.value as '0' | '1' }))
                    }
                  >
                    <option value="1">启用</option>
                    <option value="0">停用</option>
                  </select>
                </div>
              </div>
              {saveMutation.isError ? (
                <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                  {getApiErrorMessage(saveMutation.error)}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  取消
                </Button>
                <Button disabled={saveMutation.isPending || !form.content.trim()} type="submit">
                  {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  保存
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deletingRemark ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border bg-card p-5 shadow-lg">
            <h2 className="font-semibold text-lg tracking-normal">停用这条快捷备注？</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              此操作为软删除，备注将不再显示给员工，之后仍可通过编辑重新启用。
            </p>
            <p className="mt-4 rounded-md border bg-background p-3 text-sm">
              {deletingRemark.content}
            </p>
            {deleteMutation.isError ? (
              <p className="mt-4 text-destructive text-sm">
                {getApiErrorMessage(deleteMutation.error)}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeletingRemark(null)}>
                取消
              </Button>
              <Button
                disabled={deleteMutation.isPending}
                type="button"
                variant="destructive"
                onClick={() => deleteMutation.mutate(deletingRemark.id)}
              >
                {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                确认停用
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
