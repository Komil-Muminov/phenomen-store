export interface ITenant {
  id: string;
  key: string;
  name: string;
  vertical: string;
  plan: string;
  status: string;
  bundleId: string | null;
  createdAt: string;
}

export interface ITenantList {
  items: ITenant[];
  total: number;
  page: number;
  limit: number;
}

export interface ITenantCreateBody {
  key: string;
  name: string;
  vertical: string;
  plan: string;
  bundleId?: string;
}

export interface ITenantUpdateBody {
  id: string;
  name?: string;
  vertical?: string;
  plan?: string;
  bundleId?: string;
}

export interface IOwnerCreateBody {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface IPlatformSession {
  token: string;
  login: string;
  name: string;
  role: string;
}

export interface IAuditEntry {
  id: string;
  actorLogin: string;
  action: string;
  tenantKey: string | null;
  payload: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

export interface IAuditList {
  items: IAuditEntry[];
  total: number;
}

export interface IPlatformUser {
  id: string;
  login: string;
  name: string;
  role: string;
  status: string;
}

export interface ISigninResult {
  scope: 'platform' | 'shop';
  token: string;
  login?: string;
  name?: string;
  role?: string;
  tenantKey?: string;
  tenantName?: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}
