import { tenantQuery } from '@/shared/db';
import { IOtpRow, IUserAuthRow, IUserRow, OtpSettings } from '@/modules/auth/types';

const USER_COLUMNS = 'id, tenant_id, phone, email, name, role, status, created_at::text AS created_at';

export const selectUserForPasswordLogin = async (
  tenantId: string,
  email: string | null,
  phone: string | null,
): Promise<IUserAuthRow | null> => {
  const rows = await tenantQuery<IUserAuthRow>(
    tenantId,
    `SELECT ${USER_COLUMNS}, password_hash FROM users
     WHERE tenant_id = $1
       AND (
         ($2::text IS NOT NULL AND lower(email) = lower($2::text))
         OR ($3::text IS NOT NULL AND phone = $3::text)
       )
     LIMIT 1`,
    [tenantId, email, phone],
  );

  return rows[0] ?? null;
};

export const countRecentCodes = async (tenantId: string, phone: string): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    `SELECT COUNT(*)::text AS total FROM otp_codes
     WHERE tenant_id = $1 AND phone = $2 AND created_at > now() - ($3 || ' seconds')::interval`,
    [tenantId, phone, String(OtpSettings.requestWindowSeconds)],
  );

  return Number(rows[0]?.total ?? 0);
};

export const insertOtpCode = async (
  tenantId: string,
  phone: string,
  codeHash: string,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `INSERT INTO otp_codes (tenant_id, phone, code_hash, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' seconds')::interval)`,
    [tenantId, phone, codeHash, String(OtpSettings.ttlSeconds)],
  );
};

export const selectActiveOtp = async (tenantId: string, phone: string): Promise<IOtpRow | null> => {
  const rows = await tenantQuery<IOtpRow>(
    tenantId,
    `SELECT id, code_hash, attempts, expires_at::text AS expires_at
     FROM otp_codes
     WHERE tenant_id = $1 AND phone = $2 AND consumed_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1`,
    [tenantId, phone],
  );

  return rows[0] ?? null;
};

export const incrementOtpAttempts = async (tenantId: string, otpId: string): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE otp_codes SET attempts = attempts + 1 WHERE tenant_id = $1 AND id = $2',
    [tenantId, otpId],
  );
};

export const consumeOtp = async (tenantId: string, otpId: string): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE otp_codes SET consumed_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, otpId],
  );
};

export const upsertUserByPhone = async (tenantId: string, phone: string): Promise<IUserRow> => {
  const rows = await tenantQuery<IUserRow>(
    tenantId,
    `INSERT INTO users (tenant_id, phone)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id, phone) WHERE phone IS NOT NULL
     DO UPDATE SET updated_at = now()
     RETURNING ${USER_COLUMNS}`,
    [tenantId, phone],
  );

  return rows[0];
};

export const selectUserAuthById = async (
  tenantId: string,
  userId: string,
): Promise<IUserAuthRow | null> => {
  const rows = await tenantQuery<IUserAuthRow>(
    tenantId,
    `SELECT ${USER_COLUMNS}, password_hash FROM users
     WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, userId],
  );

  return rows[0] ?? null;
};

export const updateUserPassword = async (
  tenantId: string,
  userId: string,
  passwordHash: string,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE users SET password_hash = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, userId, passwordHash],
  );
};

export const selectUserById = async (tenantId: string, userId: string): Promise<IUserRow | null> => {
  const rows = await tenantQuery<IUserRow>(
    tenantId,
    `SELECT ${USER_COLUMNS} FROM users WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, userId],
  );

  return rows[0] ?? null;
};

export const updateUserProfile = async (
  tenantId: string,
  userId: string,
  name: string | null,
  email: string | null,
): Promise<IUserRow> => {
  const rows = await tenantQuery<IUserRow>(
    tenantId,
    `UPDATE users
     SET name = COALESCE($3, name), email = COALESCE($4, email), updated_at = now()
     WHERE tenant_id = $1 AND id = $2
     RETURNING ${USER_COLUMNS}`,
    [tenantId, userId, name, email],
  );

  return rows[0];
};

export const savePushToken = async (
  tenantId: string,
  userId: string,
  token: string,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE users SET push_token = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, userId, token],
  );
};
