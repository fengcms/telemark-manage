import { getApiErrorMessage } from '@/api/http';
import { useAuth } from '@/auth/auth-context';
import { getDefaultPathByRole } from '@/auth/permissions';
import { useTheme } from '@/components/theme/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Loader2, LogIn, Moon, Sun } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: session => {
      setPassword('');
      navigate(getDefaultPathByRole(session.user.role), { replace: true });
    },
  });

  if (user) {
    return <Navigate replace to={getDefaultPathByRole(user.role)} />;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_32%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--secondary)))] p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="font-semibold text-xl">Telemark</p>
          <p className="mt-2 max-w-md text-muted-foreground text-sm leading-6">
            清晰管理导入批次、客户分配和员工跟进，让电话营销团队每天看到该处理的事情。
          </p>
        </div>
        <div className="grid max-w-lg grid-cols-3 gap-3">
          {['批次导入', '客户分配', '通话记录'].map(item => (
            <div className="rounded-lg border bg-card/80 p-4 shadow-sm backdrop-blur" key={item}>
              <p className="font-medium text-sm">{item}</p>
              <p className="mt-2 h-2 rounded-full bg-primary/70" />
              <p className="mt-2 h-2 w-2/3 rounded-full bg-accent/70" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div>
              <p className="font-semibold text-lg">Telemark</p>
              <p className="text-muted-foreground text-xs">电话营销管理后台</p>
            </div>
            <Button
              aria-label="切换明暗模式"
              size="icon"
              type="button"
              variant="ghost"
              onClick={toggleTheme}
            >
              <ThemeIcon className="size-4" />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <KeyRound className="size-5" />
              </div>
              <CardTitle>登录后台</CardTitle>
              <CardDescription>使用后端账号进入管理后台</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="username">账号</Label>
                  <Input
                    autoComplete="username"
                    id="username"
                    placeholder="请输入账号"
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    autoComplete="current-password"
                    id="password"
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                  />
                </div>
                {mutation.isError ? (
                  <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                    {getApiErrorMessage(mutation.error)}
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  disabled={mutation.isPending || !username || !password}
                  type="submit"
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  登录
                </Button>
              </form>
            </CardContent>
          </Card>
          <Button
            className="mt-4 hidden w-full lg:inline-flex"
            type="button"
            variant="ghost"
            onClick={toggleTheme}
          >
            <ThemeIcon className="size-4" />
            切换{theme === 'dark' ? '亮色' : '暗色'}模式
          </Button>
        </div>
      </section>
    </div>
  );
};
