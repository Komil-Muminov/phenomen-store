export interface IUserRow {
  id: string;
  tenant_id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface IOtpRow {
  id: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
}

export const AuthErrors = {
  invalidPhone: 'Некорректный номер телефона',
  tooManyRequests: 'Слишком много запросов, попробуйте позже',
  codeNotFound: 'Код не запрашивался или истёк',
  codeInvalid: 'Неверный код',
  codeAttempts: 'Превышено число попыток ввода кода',
  userBlocked: 'Профиль заблокирован',
  profileNotFound: 'Профиль не найден',
} as const;

export const UserStatus = {
  active: 'active',
  blocked: 'blocked',
} as const;

export const OtpSettings = {
  length: 4,
  ttlSeconds: 300,
  maxAttempts: 5,
  requestWindowSeconds: 60,
  maxRequestsPerWindow: 3,
  saltRounds: 8,
} as const;

const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;

export const normalizePhone = (raw: unknown): string | null => {
  let digits = typeof raw === 'string' ? raw.replace(/\D/g, '') : '';

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (digits.length === 10) {
    digits = `7${digits}`;
  }

  if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
    return null;
  }

  return `+${digits}`;
};
