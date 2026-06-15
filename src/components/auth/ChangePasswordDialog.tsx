import { changePasswordRequest } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sha256 } from '@/lib/crypto';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Loader2, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { clearSession } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('两次输入的新密码不一致');
      }

      return changePasswordRequest({
        oldPassword: await sha256(oldPassword),
        newPassword: await sha256(newPassword),
      });
    },
    onSuccess: () => {
      clearSession();
      window.location.assign('/login');
    },
  });

  if (!open) {
    return null;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="flex items-start justify-between border-b p-5">
          <div className="flex gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <KeyRound className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg tracking-normal">修改密码</h2>
              <p className="mt-1 text-muted-foreground text-sm">修改成功后需要重新登录。</p>
            </div>
          </div>
          <Button
            aria-label="关闭"
            disabled={mutation.isPending}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="oldPassword">旧密码</Label>
            <Input
              autoComplete="current-password"
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={event => setOldPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              autoComplete="new-password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              autoComplete="new-password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
            />
          </div>

          {mutation.isError ? (
            <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {getApiErrorMessage(mutation.error)}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              disabled={mutation.isPending}
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              disabled={mutation.isPending || !oldPassword || !newPassword || !confirmPassword}
              type="submit"
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              确认修改
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
