import type { AppRouteId } from '@/auth/permissions';
import {
  BarChart3,
  ClipboardList,
  Database,
  History,
  LayoutDashboard,
  LockKeyhole,
  type LucideIcon,
  MessageSquareText,
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
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'batches', path: '/batches', label: '批次管理', icon: UploadCloud },
  { id: 'customers', path: '/customers', label: '线索管理', icon: Database },
  { id: 'users', path: '/users', label: '员工管理', icon: UsersRound },
  { id: 'assignmentLogs', path: '/assignment-logs', label: '分配日志', icon: ClipboardList },
  { id: 'callLogs', path: '/call-logs', label: '通话日志', icon: PhoneCall },
  {
    id: 'commonCallRemarks',
    path: '/common-call-remarks',
    label: '快捷备注',
    icon: MessageSquareText,
  },
  { id: 'myCustomers', path: '/my-customers', label: '我的客户', icon: UserRound },
  { id: 'myCustomersHistory', path: '/my-customers/history', label: '历史客户', icon: History },
  { id: 'mySummary', path: '/my-summary', label: '我的战报', icon: BarChart3 },
  { id: 'changePassword', path: '/profile/change-password', label: '修改密码', icon: LockKeyhole },
];
