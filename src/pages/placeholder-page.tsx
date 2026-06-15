import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const PlaceholderPage = ({ title, description, icon: Icon }: PlaceholderPageProps) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h1 className="font-semibold text-2xl tracking-normal">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">待开发</CardTitle>
        <CardDescription>
          此阶段只完成基础壳、认证和权限入口，业务表格将在对应阶段按 API 文档接入。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
          尚未调用业务接口，也没有使用 mock 数据。
        </div>
      </CardContent>
    </Card>
  </div>
);
