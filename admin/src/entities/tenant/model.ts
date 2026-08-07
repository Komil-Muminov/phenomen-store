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
