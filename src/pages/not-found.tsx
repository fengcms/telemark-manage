import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <h1 className="font-semibold text-2xl">页面不存在</h1>
    <p className="mt-2 text-muted-foreground text-sm">请检查地址是否正确。</p>
    <Button asChild className="mt-6">
      <Link to="/">返回首页</Link>
    </Button>
  </div>
);
