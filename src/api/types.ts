export type Role = 1 | 2 | 3;

export type CustomerStatus = 0 | 1 | 2 | 3 | 4;

export type CustomerType = 0 | 1;

export type PageResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
};

export type ApiErrorBody = {
  message?: string;
  error?: string;
};

export type OkResponse = {
  ok: true;
};

export type User = {
  id: number;
  username: string;
  name?: string;
  realName?: string;
  nickname?: string;
  phone?: string;
  role: Role;
  enabled?: boolean;
  status?: number;
  remark?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type DashboardOverview = {
  date: string;
  totalCalls: number;
  connectedCalls: number;
  totalDuration: number;
  avgDuration: number;
  connectRate: number;
  activeAgents: number;
  intentCustomers: number;
  newCalledCustomers: number;
};

export type AgentDailyRow = {
  userId: number;
  username: string;
  realName?: string;
  role: Role;
  totalCalls: number;
  connectedCalls: number;
  totalDuration: number;
  avgDuration: number;
  connectRate: number;
  firstCallTime: string | null;
  lastCallTime: string | null;
};

export type Batch = {
  id: number;
  name: string;
  source?: string | null;
  cost?: number;
  creatorId: number;
  creatorName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BatchSummary = {
  batchId: number;
  name: string;
  source?: string | null;
  cost: number;
  totalCustomers: number;
  assignedCustomers: number;
  unassignedCustomers: number;
  calledCustomers: number;
  uncalledCustomers: number;
  connectedCustomers: number;
  intentCustomers: number;
  invalidCustomers: number;
  connectRate: number;
  intentRate: number;
  costPerIntent: number;
};

export type Customer = {
  id: number;
  phone: string;
  name?: string;
  company?: string;
  type: CustomerType;
  status: CustomerStatus;
  remark?: string | null;
  ownerId: number | null;
  ownerName?: string | null;
  batchId?: number;
  batchName?: string;
  isDeleted?: number;
  deletedAt?: string | null;
  deletedBy?: number | null;
  deleteReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerDetail = Customer;

export type AssignmentLog = {
  id: number;
  customerId: number;
  customerPhone?: string;
  customerName?: string;
  fromUserId: number | null;
  fromUserName: string | null;
  toUserId: number | null;
  toUserName: string | null;
  operatorId: number;
  operatorName?: string;
  action: 'assign' | 'reassign' | 'recycle' | string;
  reason?: string | null;
  createdAt: string;
};

export type CallLog = {
  id: number;
  customerId: number;
  customerName?: string;
  customerPhone?: string;
  userId: number;
  username?: string;
  userRealName?: string;
  duration: number;
  callResult: CustomerStatus;
  callRemark?: string | null;
  clientRequestId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
};

export type MySummary = {
  totalCalls: number;
  connectedCalls: number;
  totalDuration: number;
  firstCallTime: string | null;
  lastCallTime: string | null;
};

export type CreateUserPayload = {
  username: string;
  password: string;
  realName: string;
  phone?: string;
  role: Role;
  remark?: string;
};

export type UpdateUserPayload = {
  realName?: string;
  phone?: string;
  role?: Role;
  status?: number;
  remark?: string;
  password?: string;
};

export type ImportBatchPayload = {
  name: string;
  source?: string;
  cost?: number;
  customers: Array<{
    phone: string;
    name?: string;
    company?: string;
  }>;
};

export type ImportBatchResponse = {
  batchId: number;
  importedCount: number;
  skippedDuplicateCount: number;
};

export type UpdateCustomerPayload = {
  name?: string;
  company?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  remark?: string | null;
};

export type DeleteCustomerPayload = {
  reason?: string;
};

export type DeleteCustomerResponse = {
  ok: true;
  id: number;
};

export type AssignCustomersPayload = {
  customerIds: number[];
  targetUserId: number | null;
  reason?: string;
};

export type AssignCustomersResponse = {
  updatedCount: number;
  loggedCount: number;
};

export type BatchUpdateCustomersPayload = {
  customerIds: number[];
  patch: {
    status?: CustomerStatus;
    type?: CustomerType;
    remark?: string | null;
  };
};

export type BatchUpdateCustomersResponse = {
  updatedCount: number;
};

export type DeleteUserResponse = {
  ok?: true;
  id?: number;
};

export type ReportCallPayload = {
  customerId: number;
  duration: number;
  callResult: CustomerStatus;
  callRemark?: string;
  clientRequestId?: string;
  startedAt?: string;
  endedAt?: string;
};

export type ReportCallResponse = {
  ok: true;
  customerId: number;
  userId: number;
  date: string;
  idempotent: boolean;
};
