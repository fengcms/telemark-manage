import type { AppRouteId } from '@/auth/permissions';
import {
  BarChart3,
  ClipboardList,
  Database,
  History,
  LayoutDashboard,
  LockKeyhole,
  type LucideIcon,
  PhoneCall,
  UploadCloud,
  UserRound,
  UsersRound,
} from 'lucide-react';

export type AppRouteConfig = {
  id: AppRouteId;
  path: string;
  label: string;
  icon: LucideIcon;
};

export const appRoutes: AppRouteConfig[] = [
  { id: 'dashboard', path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'batches', path: '/batches', label: '导入批次', icon: UploadCloud },
  { id: 'customers', path: '/customers', label: '客户管理', icon: Database },
  { id: 'users', path: '/users', label: '员工管理', icon: UsersRound },
  { id: 'assignmentLogs', path: '/assignment-logs', label: '分配日志', icon: ClipboardList },
  { id: 'callLogs', path: '/call-logs', label: '通话日志', icon: PhoneCall },
  { id: 'myCustomers', path: '/my-customers', label: '我的客户', icon: UserRound },
  { id: 'myCustomersHistory', path: '/my-customers/history', label: '跟进历史', icon: History },
  { id: 'mySummary', path: '/my-summary', label: '我的统计', icon: BarChart3 },
  { id: 'changePassword', path: '/profile/change-password', label: '修改密码', icon: LockKeyhole },
];
