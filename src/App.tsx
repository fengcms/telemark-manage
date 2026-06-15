import { routePermissions } from '@/auth/permissions';
import { ProtectedRoute, RootRedirect } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/layouts/app-layout';
import { LoginPage } from '@/pages/Login';
import { AssignmentLogsPage } from '@/pages/assignment-logs';
import { BatchesPage } from '@/pages/batches';
import { CallLogsPage } from '@/pages/call-logs';
import { ChangePasswordPage } from '@/pages/change-password';
import { CustomersPage } from '@/pages/customers';
import { DashboardPage } from '@/pages/dashboard';
import { ForbiddenPage } from '@/pages/forbidden';
import { NotFoundPage } from '@/pages/not-found';
import { PlaceholderPage } from '@/pages/placeholder-page';
import { UsersPage } from '@/pages/users';
import { appRoutes } from '@/routes/routes';
import { RouterProvider, createBrowserRouter } from 'react-router';

const pageDescriptions = {
  dashboard: '查看团队关键指标和客户跟进概览。',
  batches: '导入和查看客户批次。',
  customers: '按状态、类型和归属管理客户线索。',
  users: '查看员工列表；经理角色仅保留只读入口。',
  assignmentLogs: '追踪客户分配记录。',
  callLogs: '查看通话和跟进记录。',
  myCustomers: '员工处理自己分配到的客户。',
  myCustomersHistory: '查看个人历史跟进记录。',
  mySummary: '查看个人工作统计。',
  changePassword: '修改当前账号密码。',
} as const;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      ...appRoutes.map(route => {
        const element =
          route.id === 'changePassword' ? (
            <ChangePasswordPage key={route.id} />
          ) : route.id === 'dashboard' ? (
            <DashboardPage key={route.id} />
          ) : route.id === 'batches' ? (
            <BatchesPage key={route.id} />
          ) : route.id === 'customers' ? (
            <CustomersPage key={route.id} />
          ) : route.id === 'users' ? (
            <UsersPage key={route.id} />
          ) : route.id === 'assignmentLogs' ? (
            <AssignmentLogsPage key={route.id} />
          ) : route.id === 'callLogs' ? (
            <CallLogsPage key={route.id} />
          ) : (
            <PlaceholderPage
              key={route.id}
              description={pageDescriptions[route.id]}
              icon={route.icon}
              title={route.label}
            />
          );

        return {
          path: route.path.slice(1),
          element: (
            <ProtectedRoute allowedRoles={routePermissions[route.id]}>{element}</ProtectedRoute>
          ),
        };
      }),
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
