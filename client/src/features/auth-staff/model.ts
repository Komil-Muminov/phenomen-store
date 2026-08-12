export interface IStaffCredentials {
  login: string;
  password: string;
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

export const EMPTY_CREDENTIALS: IStaffCredentials = { login: '', password: '' };

export const isCredentialsValid = ({ login, password }: IStaffCredentials): boolean => (
  login.trim().length > 0 && password.length > 0
);

const EMAIL_MARKER = '@';

export const isStaffIdentifier = (value: string): boolean => (
  value.trim().length > 0 && !value.includes(EMAIL_MARKER)
);
