import { Request } from 'express';
import { UserRoles } from '@/shared/config';

export type TUserRole = (typeof UserRoles)[keyof typeof UserRoles];

export interface ITenantContext {
  id: string;
  key: string;
  name: string;
  status: string;
}

export interface IUserContext {
  id: string;
  tenantId: string;
  role: TUserRole;
}

export interface IAppRequest extends Request {
  tenant?: ITenantContext;
  user?: IUserContext;
}

export interface IListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IPaginationParams {
  page: number;
  limit: number;
  offset: number;
}
