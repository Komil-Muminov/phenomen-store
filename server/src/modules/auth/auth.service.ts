import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Env, HttpStatus, UserRoles } from '@/shared/config';
import { ITenantContext, IUserContext, TUserRole } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { mergeGuestCart } from '@/modules/cart';
import {
  consumeOtp,
  countRecentCodes,
  incrementOtpAttempts,
  insertOtpCode,
  savePushToken,
  selectActiveOtp,
  selectUserById,
  updateUserProfile,
  upsertUserByPhone,
} from '@/modules/auth/auth.db';
import { AuthErrors, IUserRow, OtpSettings, UserStatus, normalizePhone } from '@/modules/auth/types';

const CODE_BASE = 10;

const mapUser = (row: IUserRow) => ({
  id: row.id,
  phone: row.phone,
  email: row.email,
  name: row.name,
  role: row.role,
  createdAt: row.created_at,
});

const generateCode = (): string => Array.from(
  { length: OtpSettings.length },
  () => Math.floor(Math.random() * CODE_BASE).toString(),
).join('');

const issueToken = (user: IUserRow): string => {
  const payload: IUserContext = {
    id: user.id,
    tenantId: user.tenant_id,
    role: (user.role as TUserRole) ?? UserRoles.customer,
  };

  return jwt.sign(payload, Env.jwtSecret, { expiresIn: Env.jwtExpiresIn });
};

export const requestCode = async (tenant: ITenantContext, rawPhone: unknown) => {
  const phone = normalizePhone(rawPhone);

  if (!phone) {
    throw new AppError(AuthErrors.invalidPhone, HttpStatus.badRequest);
  }

  const recent = await countRecentCodes(tenant.id, phone);

  if (recent >= OtpSettings.maxRequestsPerWindow) {
    throw new AppError(AuthErrors.tooManyRequests, HttpStatus.conflict);
  }

  const code = generateCode();

  await insertOtpCode(tenant.id, phone, await bcrypt.hash(code, OtpSettings.saltRounds));

  return {
    phone,
    expiresIn: OtpSettings.ttlSeconds,
    code: Env.isProduction ? null : code,
  };
};

export const verifyCode = async (
  tenant: ITenantContext,
  rawPhone: unknown,
  rawCode: unknown,
  guestKey: string | null,
) => {
  const phone = normalizePhone(rawPhone);
  const code = pickString(rawCode);

  if (!phone) {
    throw new AppError(AuthErrors.invalidPhone, HttpStatus.badRequest);
  }

  const otp = await selectActiveOtp(tenant.id, phone);

  if (!otp) {
    throw new AppError(AuthErrors.codeNotFound, HttpStatus.notFound);
  }

  if (otp.attempts >= OtpSettings.maxAttempts) {
    throw new AppError(AuthErrors.codeAttempts, HttpStatus.conflict);
  }

  const matched = await bcrypt.compare(code, otp.code_hash);

  if (!matched) {
    await incrementOtpAttempts(tenant.id, otp.id);
    throw new AppError(AuthErrors.codeInvalid, HttpStatus.unauthorized);
  }

  await consumeOtp(tenant.id, otp.id);

  const user = await upsertUserByPhone(tenant.id, phone);

  if (user.status === UserStatus.blocked) {
    throw new AppError(AuthErrors.userBlocked, HttpStatus.forbidden);
  }

  await mergeGuestCart(tenant, user.id, guestKey);

  return { token: issueToken(user), user: mapUser(user) };
};

export const getProfile = async (tenant: ITenantContext, userId: string) => {
  const user = await selectUserById(tenant.id, userId);

  if (!user) {
    throw new AppError(AuthErrors.profileNotFound, HttpStatus.notFound);
  }

  return mapUser(user);
};

export const updateProfile = async (
  tenant: ITenantContext,
  userId: string,
  payload: Record<string, unknown>,
) => {
  const name = pickString(payload.name) || null;
  const email = pickString(payload.email) || null;

  return mapUser(await updateUserProfile(tenant.id, userId, name, email));
};

export const registerPushToken = async (
  tenant: ITenantContext,
  userId: string,
  payload: Record<string, unknown>,
): Promise<{ saved: boolean }> => {
  const token = pickString(payload.token);

  if (!token) {
    throw new AppError(AuthErrors.profileNotFound, HttpStatus.badRequest);
  }

  await savePushToken(tenant.id, userId, token);

  return { saved: true };
};
