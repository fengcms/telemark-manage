import { getApiErrorMessage } from '@/api/client';
import {
  assignCustomers,
  batchUpdateCustomers,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from '@/api/customers';
import type { CustomerStatus, CustomerType, UpdateCustomerPayload } from '@/api/types';
import { getUsers } from '@/api/users';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerStatusLabels, customerTypeLabels, roles } from '@/lib/constants';
import { formatDateTime, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Search, Trash2, UserCheck } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

type CustomerTab = 'public' | 'assigned' | 'all';

const pageSize = 50;

const tabs: Array<{ value: CustomerTab; label: string }> = [
  { value: 'public', label: '公海' },
  { value: 'assigned', label: '已分配' },
  { value: 'all', label: '全量' },
];

const statusOptions: CustomerStatus[] = [0, 1, 2, 3, 4];
const typeOptions: CustomerType[] = [0, 1];

const toOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<CustomerTab>('public');
  const [page, setPage] = useState(0);
  const [nameLike, setNameLike] = useState('');
  const [phoneLike, setPhoneLike] = useState('');
  const [companyLike, setCompanyLike] = useState('');
  const [filters, setFilters] = useState({ nameLike: '', phoneLike: '', companyLike: '' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [assignTarget, setAssignTarget] = useState<string>('null');
  const [assignReason, setAssignReason] = useState('');
  const [batchStatus, setBatchStatus] = useState('');
  const [batchType, setBatchType] = useState('');
  const [batchRemark, setBatchRemark] = useState('');
  const [editForm, setEditForm] = useState<UpdateCustomerPayload>({});

  const customerQuery = useQuery({
    queryKey: ['customers', tab, page, filters],
    queryFn: () =>
      getCustomers({
        page,
        pagesize: pageSize,
        sort: '-id',
        is_assigned: tab === 'public' ? 0 : tab === 'assigned' ? 1 : undefined,
        'name-like': filters.nameLike || undefined,
        'phone-like': filters.phoneLike || undefined,
        'company-like': filters.companyLike || undefined,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ['customers', activeCustomerId],
    queryFn: () => getCustomer(activeCustomerId ?? 0),
    enabled: activeCustomerId !== null,
  });

  const usersQuery = useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: () => getUsers({ is_disable: 0, page: 0, pagesize: 100 }),
  });

  const assignableUsers = useMemo(
    () =>
      (usersQuery.data?.list ?? []).filter(
        user => user.role === roles.manager || user.role === roles.employee,
      ),
    [usersQuery.data],
  );

  useEffect(() => {
    if (detailQuery.data) {
      setEditForm({
        name: detailQuery.data.name ?? '',
        company: detailQuery.data.company ?? '',
        status: detailQuery.data.status,
        type: detailQuery.data.type,
        remark: detailQuery.data.remark ?? '',
      });
      setDeleteReason('');
    }
  }, [detailQuery.data]);

  const invalidateCustomers = () => {
    void queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!activeCustomerId) {
        throw new Error('请先选择客户');
      }

      return updateCustomer(activeCustomerId, editForm);
    },
    onSuccess: invalidateCustomers,
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!activeCustomerId) {
        throw new Error('请先选择客户');
      }

      return deleteCustomer(activeCustomerId, { reason: toOptionalText(deleteReason) });
    },
    onSuccess: () => {
      setActiveCustomerId(null);
      setSelectedIds([]);
      invalidateCustomers();
    },
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignCustomers({
        customerIds: selectedIds,
        targetUserId: assignTarget === 'null' ? null : Number(assignTarget),
        reason: toOptionalText(assignReason),
      }),
    onSuccess: () => {
      setSelectedIds([]);
      setAssignReason('');
      invalidateCustomers();
    },
  });

  const batchUpdateMutation = useMutation({
    mutationFn: () => {
      const patch = {
        status: batchStatus ? (Number(batchStatus) as CustomerStatus) : undefined,
        type: batchType ? (Number(batchType) as CustomerType) : undefined,
        remark: batchRemark.trim() ? batchRemark.trim() : undefined,
      };

      if (patch.status === undefined && patch.type === undefined && patch.remark === undefined) {
        throw new Error('请至少选择一个批量更新字段');
      }

      return batchUpdateCustomers({ customerIds: selectedIds, patch });
    },
    onSuccess: () => {
      setSelectedIds([]);
      setBatchStatus('');
      setBatchType('');
      setBatchRemark('');
      invalidateCustomers();
    },
  });

  const rows = customerQuery.data?.list ?? [];
  const total = customerQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const detail = detailQuery.data;

  const toggleSelected = (id: number) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSelectedIds([]);
    setFilters({
      nameLike: nameLike.trim(),
      phoneLike: phoneLike.trim(),
      companyLike: companyLike.trim(),
    });
  };

  const renderMutationError = (error: unknown) => (
    <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
      {getApiErrorMessage(error)}
    </p>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">线索管理</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          管理公海和已分配线索，支持详情、编辑、作废、分配和批量更新。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>线索列表</CardTitle>
                <CardDescription>分页从 0 开始，默认按最新线索排序。</CardDescription>
              </div>
              <div className="flex rounded-md border bg-background p-1">
                {tabs.map(item => (
                  <button
                    className={cn(
                      'h-8 rounded-sm px-3 text-sm transition-colors',
                      tab === item.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setTab(item.value);
                      setPage(0);
                      setSelectedIds([]);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={onFilterSubmit}>
              <Input
                placeholder="客户名称"
                value={nameLike}
                onChange={event => setNameLike(event.target.value)}
              />
              <Input
                placeholder="手机号"
                value={phoneLike}
                onChange={event => setPhoneLike(event.target.value)}
              />
              <Input
                placeholder="公司"
                value={companyLike}
                onChange={event => setCompanyLike(event.target.value)}
              />
              <Button type="submit" variant="outline">
                <Search className="size-4" />
                查询
              </Button>
            </form>
          </CardHeader>

          <CardContent className="space-y-4">
            {customerQuery.isLoading ? (
              <LoadingPage className="min-h-[320px]" text="正在加载线索" />
            ) : customerQuery.isError ? (
              <ErrorState
                description={getApiErrorMessage(customerQuery.error)}
                onRetry={() => void customerQuery.refetch()}
              />
            ) : rows.length === 0 ? (
              <EmptyState title="暂无线索" description="当前条件下没有客户线索。" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="w-10 px-3 py-3 text-left font-medium">
                        <input
                          aria-label="全选当前页"
                          checked={rows.every(row => selectedIds.includes(row.id))}
                          type="checkbox"
                          onChange={event =>
                            setSelectedIds(
                              event.target.checked
                                ? Array.from(new Set([...selectedIds, ...rows.map(row => row.id)]))
                                : selectedIds.filter(id => !rows.some(row => row.id === id)),
                            )
                          }
                        />
                      </th>
                      <th className="px-3 py-3 text-left font-medium">客户</th>
                      <th className="px-3 py-3 text-left font-medium">电话</th>
                      <th className="px-3 py-3 text-left font-medium">公司</th>
                      <th className="px-3 py-3 text-left font-medium">状态</th>
                      <th className="px-3 py-3 text-left font-medium">类型</th>
                      <th className="px-3 py-3 text-left font-medium">归属</th>
                      <th className="px-3 py-3 text-left font-medium">更新时间</th>
                      <th className="px-3 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(customer => (
                      <tr
                        className={cn(
                          'border-b last:border-0 hover:bg-secondary/45',
                          activeCustomerId === customer.id && 'bg-secondary',
                        )}
                        key={customer.id}
                      >
                        <td className="px-3 py-3">
                          <input
                            aria-label={`选择线索 ${customer.id}`}
                            checked={selectedIds.includes(customer.id)}
                            type="checkbox"
                            onChange={() => toggleSelected(customer.id)}
                          />
                        </td>
                        <td className="px-3 py-3 font-medium">{customer.name || '-'}</td>
                        <td className="px-3 py-3">{customer.phone}</td>
                        <td className="px-3 py-3">{customer.company || '-'}</td>
                        <td className="px-3 py-3">{customerStatusLabels[customer.status]}</td>
                        <td className="px-3 py-3">{customerTypeLabels[customer.type]}</td>
                        <td className="px-3 py-3">
                          {customer.ownerName || customer.ownerId || '公海'}
                        </td>
                        <td className="px-3 py-3">{formatDateTime(customer.updatedAt)}</td>
                        <td className="px-3 py-3 text-right">
                          <Button
                            size="sm"
                            type="button"
                            variant={activeCustomerId === customer.id ? 'secondary' : 'outline'}
                            onClick={() => setActiveCustomerId(customer.id)}
                          >
                            详情
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
                已选 {formatNumber(selectedIds.length)} 条，第 {formatNumber(page + 1)} /{' '}
                {formatNumber(totalPages)} 页，共 {formatNumber(total)} 条
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 0 || customerQuery.isFetching}
                  type="button"
                  variant="outline"
                  onClick={() => setPage(current => Math.max(0, current - 1))}
                >
                  上一页
                </Button>
                <Button
                  disabled={page + 1 >= totalPages || customerQuery.isFetching}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>批量操作</CardTitle>
              <CardDescription>分配弹窗员工数据来自 GET /api/users?is_disable=0。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignTarget">分配目标</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="assignTarget"
                  value={assignTarget}
                  onChange={event => setAssignTarget(event.target.value)}
                >
                  <option value="null">回收到公海</option>
                  {assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.realName || user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignReason">分配原因</Label>
                <Input
                  id="assignReason"
                  value={assignReason}
                  onChange={event => setAssignReason(event.target.value)}
                />
              </div>
              {assignMutation.isError ? renderMutationError(assignMutation.error) : null}
              <Button
                className="w-full"
                disabled={selectedIds.length === 0 || assignMutation.isPending}
                type="button"
                onClick={() => assignMutation.mutate()}
              >
                {assignMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserCheck className="size-4" />
                )}
                执行分配
              </Button>

              <div className="border-t pt-4" />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="batchStatus">批量状态</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="batchStatus"
                    value={batchStatus}
                    onChange={event => setBatchStatus(event.target.value)}
                  >
                    <option value="">不修改</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {customerStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchType">批量类型</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="batchType"
                    value={batchType}
                    onChange={event => setBatchType(event.target.value)}
                  >
                    <option value="">不修改</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>
                        {customerTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchRemark">批量备注</Label>
                <Input
                  id="batchRemark"
                  value={batchRemark}
                  onChange={event => setBatchRemark(event.target.value)}
                />
              </div>
              {batchUpdateMutation.isError ? renderMutationError(batchUpdateMutation.error) : null}
              <Button
                className="w-full"
                disabled={selectedIds.length === 0 || batchUpdateMutation.isPending}
                type="button"
                variant="secondary"
                onClick={() => batchUpdateMutation.mutate()}
              >
                {batchUpdateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                批量更新
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>线索详情</CardTitle>
              <CardDescription>选择一条线索后可编辑或作废。</CardDescription>
            </CardHeader>
            <CardContent>
              {!activeCustomerId ? (
                <EmptyState title="未选择线索" description="点击左侧列表中的一行查看详情。" />
              ) : detailQuery.isLoading ? (
                <LoadingPage className="min-h-[260px]" text="正在加载线索详情" />
              ) : detailQuery.isError ? (
                <ErrorState
                  description={getApiErrorMessage(detailQuery.error)}
                  onRetry={() => void detailQuery.refetch()}
                />
              ) : detail ? (
                <div className="space-y-4">
                  <div className="rounded-md border bg-background p-4 text-sm">
                    <div className="font-medium">{detail.name || '未命名客户'}</div>
                    <div className="mt-1 text-muted-foreground">{detail.phone}</div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                      <span>批次：{detail.batchName || detail.batchId || '-'}</span>
                      <span>归属：{detail.ownerName || detail.ownerId || '公海'}</span>
                      <span>创建：{formatDateTime(detail.createdAt)}</span>
                      <span>更新：{formatDateTime(detail.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="editName">客户名称</Label>
                      <Input
                        id="editName"
                        value={editForm.name ?? ''}
                        onChange={event =>
                          setEditForm(current => ({ ...current, name: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editCompany">公司</Label>
                      <Input
                        id="editCompany"
                        value={editForm.company ?? ''}
                        onChange={event =>
                          setEditForm(current => ({ ...current, company: event.target.value }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="editStatus">状态</Label>
                        <select
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          id="editStatus"
                          value={editForm.status ?? 0}
                          onChange={event =>
                            setEditForm(current => ({
                              ...current,
                              status: Number(event.target.value) as CustomerStatus,
                            }))
                          }
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {customerStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editType">类型</Label>
                        <select
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          id="editType"
                          value={editForm.type ?? 0}
                          onChange={event =>
                            setEditForm(current => ({
                              ...current,
                              type: Number(event.target.value) as CustomerType,
                            }))
                          }
                        >
                          {typeOptions.map(type => (
                            <option key={type} value={type}>
                              {customerTypeLabels[type]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editRemark">备注</Label>
                      <textarea
                        className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        id="editRemark"
                        value={editForm.remark ?? ''}
                        onChange={event =>
                          setEditForm(current => ({ ...current, remark: event.target.value }))
                        }
                      />
                    </div>
                    {updateMutation.isError ? renderMutationError(updateMutation.error) : null}
                    <Button
                      className="w-full"
                      disabled={updateMutation.isPending}
                      type="button"
                      onClick={() => updateMutation.mutate()}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      保存修改
                    </Button>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <Label htmlFor="deleteReason">作废原因</Label>
                    <Input
                      id="deleteReason"
                      value={deleteReason}
                      onChange={event => setDeleteReason(event.target.value)}
                    />
                    {deleteMutation.isError ? renderMutationError(deleteMutation.error) : null}
                    <Button
                      className="w-full"
                      disabled={deleteMutation.isPending}
                      type="button"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      作废线索
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
