import { getApiErrorMessage } from '@/api/client';
import type { Role, UpdateUserPayload, User } from '@/api/types';
import { createUser, deleteUser, getUsers, updateUser } from '@/api/users';
import { useAuth } from '@/auth/auth-context';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleLabels, roles } from '@/lib/constants';
import { sha256 } from '@/lib/crypto';
import { formatDateTime, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, ShieldOff, UserPlus } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

const pageSize = 10;

const roleOptions: Role[] = [roles.manager, roles.employee];

type UserForm = {
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: Role;
  remark: string;
};

type EditForm = {
  realName: string;
  phone: string;
  role: Role;
  status: number;
  remark: string;
  password: string;
};

const emptyCreateForm: UserForm = {
  username: '',
  password: '',
  realName: '',
  phone: '',
  role: roles.employee,
  remark: '',
};

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManageUsers = user?.role === roles.superAdmin;
  const [page, setPage] = useState(0);
  const [usernameLike, setUsernameLike] = useState('');
  const [realNameLike, setRealNameLike] = useState('');
  const [statusFilter, setStatusFilter] = useState<'0' | '1'>('0');
  const [filters, setFilters] = useState({
    usernameLike: '',
    realNameLike: '',
    isDisable: 0 as 0 | 1,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<UserForm>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditForm>({
    realName: '',
    phone: '',
    role: roles.employee,
    status: 1,
    remark: '',
    password: '',
  });

  const usersQuery = useQuery({
    queryKey: ['users', page, filters],
    queryFn: () =>
      getUsers({
        page,
        pagesize: pageSize,
        is_disable: filters.isDisable,
        'username-like': filters.usernameLike || undefined,
        'realName-like': filters.realNameLike || undefined,
      }),
  });

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        realName: selectedUser.realName ?? '',
        phone: selectedUser.phone ?? '',
        role: selectedUser.role,
        status: selectedUser.status ?? 1,
        remark: selectedUser.remark ?? '',
        password: '',
      });
    }
  }, [selectedUser]);

  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const createMutation = useMutation({
    mutationFn: async () =>
      createUser({
        username: createForm.username.trim(),
        password: await sha256(createForm.password),
        realName: createForm.realName.trim(),
        phone: createForm.phone.trim() || undefined,
        role: createForm.role,
        remark: createForm.remark.trim() || undefined,
      }),
    onSuccess: () => {
      setCreateForm(emptyCreateForm);
      setPage(0);
      invalidateUsers();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) {
        throw new Error('请先选择员工');
      }

      const payload: UpdateUserPayload = {
        realName: editForm.realName.trim(),
        phone: editForm.phone.trim() || undefined,
        role: editForm.role,
        status: editForm.status,
        remark: editForm.remark.trim() || undefined,
      };

      if (editForm.password.trim()) {
        payload.password = await sha256(editForm.password);
      }

      return updateUser(selectedUser.id, payload);
    },
    onSuccess: updated => {
      setSelectedUser(updated);
      invalidateUsers();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedUser) {
        throw new Error('请先选择员工');
      }

      return deleteUser(selectedUser.id);
    },
    onSuccess: () => {
      setSelectedUser(null);
      invalidateUsers();
    },
  });

  const rows = usersQuery.data?.list ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setFilters({
      usernameLike: usernameLike.trim(),
      realNameLike: realNameLike.trim(),
      isDisable: Number(statusFilter) as 0 | 1,
    });
  };

  const onCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  const onUpdateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate();
  };

  const renderMutationError = (error: unknown) => (
    <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
      {getApiErrorMessage(error)}
    </p>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">
          {canManageUsers ? '员工管理' : '员工列表'}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {canManageUsers ? '创建员工、调整角色和禁用账号。' : '经理角色仅可查看员工列表。'}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>员工列表</CardTitle>
              <CardDescription>默认查询在职员工，可切换查看已禁用员工。</CardDescription>
            </div>
            <form
              className="grid gap-3 md:grid-cols-[1fr_1fr_160px_auto]"
              onSubmit={onFilterSubmit}
            >
              <Input
                placeholder="用户名"
                value={usernameLike}
                onChange={event => setUsernameLike(event.target.value)}
              />
              <Input
                placeholder="真实姓名"
                value={realNameLike}
                onChange={event => setRealNameLike(event.target.value)}
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value as '0' | '1')}
              >
                <option value="0">在职</option>
                <option value="1">已禁用</option>
              </select>
              <Button type="submit" variant="outline">
                <Search className="size-4" />
                查询
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-4">
            {usersQuery.isLoading ? (
              <LoadingPage className="min-h-[320px]" text="正在加载员工" />
            ) : usersQuery.isError ? (
              <ErrorState
                description={getApiErrorMessage(usersQuery.error)}
                onRetry={() => void usersQuery.refetch()}
              />
            ) : rows.length === 0 ? (
              <EmptyState title="暂无员工" description="当前条件下没有员工数据。" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="px-3 py-3 text-left font-medium">员工</th>
                      <th className="px-3 py-3 text-left font-medium">电话</th>
                      <th className="px-3 py-3 text-left font-medium">角色</th>
                      <th className="px-3 py-3 text-left font-medium">状态</th>
                      <th className="px-3 py-3 text-left font-medium">创建时间</th>
                      <th className="px-3 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr
                        className={cn(
                          'border-b last:border-0 hover:bg-secondary/45',
                          selectedUser?.id === row.id && 'bg-secondary',
                        )}
                        key={row.id}
                      >
                        <td className="px-3 py-3">
                          <div className="font-medium">{row.realName || row.username}</div>
                          <div className="text-muted-foreground text-xs">{row.username}</div>
                        </td>
                        <td className="px-3 py-3">{row.phone || '-'}</td>
                        <td className="px-3 py-3">{roleLabels[row.role]}</td>
                        <td className="px-3 py-3">{row.status === 0 ? '已禁用' : '在职'}</td>
                        <td className="px-3 py-3">{formatDateTime(row.createdAt)}</td>
                        <td className="px-3 py-3 text-right">
                          <Button
                            disabled={!canManageUsers}
                            size="sm"
                            type="button"
                            variant={selectedUser?.id === row.id ? 'secondary' : 'outline'}
                            onClick={() => setSelectedUser(row)}
                          >
                            {canManageUsers ? '编辑' : '只读'}
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
                  disabled={page <= 0 || usersQuery.isFetching}
                  type="button"
                  variant="outline"
                  onClick={() => setPage(current => Math.max(0, current - 1))}
                >
                  上一页
                </Button>
                <Button
                  disabled={page + 1 >= totalPages || usersQuery.isFetching}
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
          {canManageUsers ? (
            <Card>
              <CardHeader>
                <CardTitle>创建员工</CardTitle>
                <CardDescription>密码会在提交前使用 SHA-256 处理。</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={onCreateSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="createUsername">用户名</Label>
                    <Input
                      id="createUsername"
                      value={createForm.username}
                      onChange={event =>
                        setCreateForm(current => ({ ...current, username: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createPassword">初始密码</Label>
                    <Input
                      id="createPassword"
                      type="password"
                      value={createForm.password}
                      onChange={event =>
                        setCreateForm(current => ({ ...current, password: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createRealName">真实姓名</Label>
                    <Input
                      id="createRealName"
                      value={createForm.realName}
                      onChange={event =>
                        setCreateForm(current => ({ ...current, realName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createPhone">电话</Label>
                    <Input
                      id="createPhone"
                      value={createForm.phone}
                      onChange={event =>
                        setCreateForm(current => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createRole">角色</Label>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      id="createRole"
                      value={createForm.role}
                      onChange={event =>
                        setCreateForm(current => ({
                          ...current,
                          role: Number(event.target.value) as Role,
                        }))
                      }
                    >
                      {roleOptions.map(role => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createRemark">备注</Label>
                    <Input
                      id="createRemark"
                      value={createForm.remark}
                      onChange={event =>
                        setCreateForm(current => ({ ...current, remark: event.target.value }))
                      }
                    />
                  </div>
                  {createMutation.isError ? renderMutationError(createMutation.error) : null}
                  <Button
                    className="w-full"
                    disabled={
                      createMutation.isPending ||
                      !createForm.username ||
                      !createForm.password ||
                      !createForm.realName
                    }
                    type="submit"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    创建员工
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{canManageUsers ? '编辑员工' : '权限说明'}</CardTitle>
              <CardDescription>
                {canManageUsers
                  ? '可修改资料、角色、状态或重置密码。'
                  : '经理角色只能查看员工列表。'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canManageUsers ? (
                <EmptyState
                  title="只读模式"
                  description="新增、编辑、禁用和重置密码仅超级管理员可用。"
                />
              ) : !selectedUser ? (
                <EmptyState title="未选择员工" description="点击列表中的编辑按钮。" />
              ) : (
                <form className="space-y-4" onSubmit={onUpdateSubmit}>
                  <div className="rounded-md border bg-background p-4 text-sm">
                    <div className="font-medium">{selectedUser.username}</div>
                    <div className="mt-1 text-muted-foreground">ID: {selectedUser.id}</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRealName">真实姓名</Label>
                    <Input
                      id="editRealName"
                      value={editForm.realName}
                      onChange={event =>
                        setEditForm(current => ({ ...current, realName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhone">电话</Label>
                    <Input
                      id="editPhone"
                      value={editForm.phone}
                      onChange={event =>
                        setEditForm(current => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="editRole">角色</Label>
                      <select
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        id="editRole"
                        value={editForm.role}
                        onChange={event =>
                          setEditForm(current => ({
                            ...current,
                            role: Number(event.target.value) as Role,
                          }))
                        }
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editStatus">状态</Label>
                      <select
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        id="editStatus"
                        value={editForm.status}
                        onChange={event =>
                          setEditForm(current => ({
                            ...current,
                            status: Number(event.target.value),
                          }))
                        }
                      >
                        <option value={1}>在职</option>
                        <option value={0}>已禁用</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRemark">备注</Label>
                    <Input
                      id="editRemark"
                      value={editForm.remark}
                      onChange={event =>
                        setEditForm(current => ({ ...current, remark: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resetPassword">重置密码</Label>
                    <Input
                      id="resetPassword"
                      placeholder="留空则不修改"
                      type="password"
                      value={editForm.password}
                      onChange={event =>
                        setEditForm(current => ({ ...current, password: event.target.value }))
                      }
                    />
                  </div>
                  {updateMutation.isError ? renderMutationError(updateMutation.error) : null}
                  {deleteMutation.isError ? renderMutationError(deleteMutation.error) : null}
                  <Button className="w-full" disabled={updateMutation.isPending} type="submit">
                    {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    保存员工
                  </Button>
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
                      <ShieldOff className="size-4" />
                    )}
                    禁用员工
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
