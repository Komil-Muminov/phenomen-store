import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EntityStatus, Env, HttpStatus, UserRoles } from '@/shared/config';
import { ITenantContext, IUserContext, TUserRole } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { mergeGuestCart } from '@/modules/cart';
import { isMailConfigured, minutesFromSeconds, sendOtpLetter } from '@/modules/mail';
import {
  consumeOtp,
  countRecentCodes,
  incrementOtpAttempts,
  insertOtpCode,
  savePushToken,
  selectActiveOtp,
  selectUserAuthById,
  selectUserById,
  existsUserEmail,
  existsUserPhone,
  selectUserByIdWithPassword,
  selectUserForPasswordLogin,
  updateUserEmail,
  updateUserPassword,
  updateUserProfile,
  upsertUserByEmail,
} from '@/modules/auth/auth.db';
import {
  AuthErrors,
  IUserRow,
  OtpSettings,
  PasswordSettings,
  normalizeEmail,
  normalizePhone,
} from '@/modules/auth/types';

const EMAIL_MARKER = '@';

const CODE_BASE = 10;

const mapUser = (row: IUserRow) => ({
  id: row.id,
  phone: row.phone,
  email: row.email,
  name: row.name,
  lastName: row.last_name,
  role: row.role,
  profileComplete: Boolean(row.name && row.last_name && row.phone),
  createdAt: row.created_at,
});

const generateCode = (): string => Array.from(
  { length: OtpSettings.length },
  () => Math.floor(Math.random() * CODE_BASE).toString(),
).join('');

export const issueToken = (user: IUserRow): string => {
  const payload: IUserContext = {
    id: user.id,
    tenantId: user.tenant_id,
    role: (user.role as TUserRole) ?? UserRoles.customer,
    login: user.email ?? user.phone ?? user.id,
  };

  return jwt.sign(payload, Env.jwtSecret, { expiresIn: Env.jwtExpiresIn as any });
};

export const loginWithPassword = async (
  tenant: ITenantContext,
  rawLogin: unknown,
  rawPassword: unknown,
) => {
  const login = pickString(rawLogin);
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!login || !password) {
    throw new AppError(AuthErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  const user = await selectUserForPasswordLogin(
    tenant.id,
    login.includes(EMAIL_MARKER) ? login : null,
    normalizePhone(login),
  );
  const matched = await bcrypt.compare(
    password,
    user?.password_hash ?? PasswordSettings.dummyHash,
  );

  if (!user || !user.password_hash || !matched) {
    throw new AppError(AuthErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  if (user.status !== EntityStatus.active) {
    throw new AppError(AuthErrors.userBlocked, HttpStatus.forbidden);
  }

  return { token: issueToken(user), user: mapUser(user) };
};

export const loginStaffWithPassword = async (
  tenant: ITenantContext,
  userId: string,
  rawPassword: unknown,
) => {
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!password) {
    throw new AppError(AuthErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  const user = await selectUserByIdWithPassword(tenant.id, userId);
  const matched = await bcrypt.compare(
    password,
    user?.password_hash ?? PasswordSettings.dummyHash,
  );

  if (!user || !user.password_hash || !matched) {
    throw new AppError(AuthErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  if (user.status !== EntityStatus.active) {
    throw new AppError(AuthErrors.userBlocked, HttpStatus.forbidden);
  }

  return { token: issueToken(user), user: mapUser(user) };
};

export const changePassword = async (
  tenant: ITenantContext,
  userId: string,
  rawCurrent: unknown,
  rawNext: unknown,
) => {
  const current = typeof rawCurrent === 'string' ? rawCurrent : '';
  const next = typeof rawNext === 'string' ? rawNext : '';

  if (next.length < PasswordSettings.minLength) {
    throw new AppError(AuthErrors.passwordTooShort, HttpStatus.badRequest);
  }

  if (next === current) {
    throw new AppError(AuthErrors.passwordSame, HttpStatus.badRequest);
  }

  const user = await selectUserAuthById(tenant.id, userId);

  if (!user) {
    throw new AppError(AuthErrors.profileNotFound, HttpStatus.notFound);
  }

  const matched = user.password_hash
    ? await bcrypt.compare(current, user.password_hash)
    : true;

  if (!matched) {
    throw new AppError(AuthErrors.currentPasswordWrong, HttpStatus.badRequest);
  }

  await updateUserPassword(
    tenant.id,
    user.id,
    await bcrypt.hash(next, PasswordSettings.saltRounds),
  );

  return { changed: true };
};

export const requestCode = async (tenant: ITenantContext, rawEmail: unknown) => {
  const email = normalizeEmail(rawEmail);

  if (!email) {
    throw new AppError(AuthErrors.invalidEmail, HttpStatus.badRequest);
  }

  const recent = await countRecentCodes(tenant.id, email);

  if (recent >= OtpSettings.maxRequestsPerWindow) {
    throw new AppError(AuthErrors.tooManyRequests, HttpStatus.conflict);
  }

  const code = generateCode();

  await insertOtpCode(tenant.id, email, await bcrypt.hash(code, OtpSettings.saltRounds));
  await sendOtpLetter({
    to: email,
    code,
    shopName: tenant.name,
    ttlMinutes: minutesFromSeconds(OtpSettings.ttlSeconds),
  });

  return {
    email,
    delivered: isMailConfigured(),
    expiresIn: OtpSettings.ttlSeconds,
    code: Env.isProduction ? null : code,
  };
};

export const verifyCode = async (
  tenant: ITenantContext,
  rawEmail: unknown,
  rawCode: unknown,
  guestKey: string | null,
) => {
  const email = normalizeEmail(rawEmail);
  const code = pickString(rawCode);

  if (!email) {
    throw new AppError(AuthErrors.invalidEmail, HttpStatus.badRequest);
  }

  const otp = await selectActiveOtp(tenant.id, email);

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

  const user = await upsertUserByEmail(tenant.id, email);

  if (user.status === EntityStatus.disabled) {
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
  const phone = payload.phone === undefined ? null : normalizePhone(payload.phone);

  if (payload.phone !== undefined && !phone) {
    throw new AppError(AuthErrors.invalidPhone, HttpStatus.badRequest);
  }

  if (phone && await existsUserPhone(tenant.id, userId, phone)) {
    throw new AppError(AuthErrors.phoneTaken, HttpStatus.conflict);
  }

  return mapUser(await updateUserProfile(tenant.id, userId, {
    name: pickString(payload.name) || null,
    lastName: pickString(payload.lastName) || null,
    phone,
  }));
};

export const requestEmailChange = async (
  tenant: ITenantContext,
  userId: string,
  payload: Record<string, unknown>,
) => {
  const email = normalizeEmail(payload.email);

  if (!email) {
    throw new AppError(AuthErrors.invalidEmail, HttpStatus.badRequest);
  }

  const current = await selectUserById(tenant.id, userId);

  if (current?.email && current.email.toLowerCase() === email) {
    throw new AppError(AuthErrors.emailSame, HttpStatus.badRequest);
  }

  if (await existsUserEmail(tenant.id, userId, email)) {
    throw new AppError(AuthErrors.emailTaken, HttpStatus.conflict);
  }

  const recent = await countRecentCodes(tenant.id, email);

  if (recent >= OtpSettings.maxRequestsPerWindow) {
    throw new AppError(AuthErrors.tooManyRequests, HttpStatus.conflict);
  }

  const code = generateCode();

  await insertOtpCode(tenant.id, email, await bcrypt.hash(code, OtpSettings.saltRounds));
  await sendOtpLetter({
    to: email,
    code,
    shopName: tenant.name,
    ttlMinutes: minutesFromSeconds(OtpSettings.ttlSeconds),
  });

  return {
    email,
    delivered: isMailConfigured(),
    expiresIn: OtpSettings.ttlSeconds,
    code: Env.isProduction ? null : code,
  };
};

export const confirmEmailChange = async (
  tenant: ITenantContext,
  userId: string,
  payload: Record<string, unknown>,
) => {
  const email = normalizeEmail(payload.email);
  const code = pickString(payload.code);

  if (!email) {
    throw new AppError(AuthErrors.invalidEmail, HttpStatus.badRequest);
  }

  if (await existsUserEmail(tenant.id, userId, email)) {
    throw new AppError(AuthErrors.emailTaken, HttpStatus.conflict);
  }

  const otp = await selectActiveOtp(tenant.id, email);

  if (!otp) {
    throw new AppError(AuthErrors.codeNotFound, HttpStatus.notFound);
  }

  if (otp.attempts >= OtpSettings.maxAttempts) {
    throw new AppError(AuthErrors.codeAttempts, HttpStatus.conflict);
  }

  if (!await bcrypt.compare(code, otp.code_hash)) {
    await incrementOtpAttempts(tenant.id, otp.id);

    throw new AppError(AuthErrors.codeInvalid, HttpStatus.unauthorized);
  }

  await consumeOtp(tenant.id, otp.id);

  return mapUser(await updateUserEmail(tenant.id, userId, email));
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
