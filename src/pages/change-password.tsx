import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export const ChangePasswordPage = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>账号安全</CardTitle>
          <CardDescription>定期修改密码可以降低账号风险。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => setOpen(true)}>
            修改密码
          </Button>
        </CardContent>
      </Card>
      <ChangePasswordDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};
