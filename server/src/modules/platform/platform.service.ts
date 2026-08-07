import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Env, ErrorMessages, HttpStatus, PlatformRoles, UserRoles } from '@/shared/config';
import { IListResult, IPlatformContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { invalidateTenantCache } from '@/modules/tenant';
import { loginWithPassword } from '@/modules/auth';
import { applyVerticalPreset } from '@/modules/attributes';
import {
  countTenants,
  existsStaffLogin,
  existsTenantKey,
  insertAuditEntry,
  insertStaffLogin,
  selectStaffLogin,
  insertDefaultConfig,
  insertPlatformUser,
  insertTenant,
  insertTenantOwner,
  selectAuditActions,
  selectAuditEntries,
  selectPlatformUserById,
  selectPlatformUserByLogin,
  selectTenantById,
  selectTenants,
  setTenantStatus,
  touchPlatformLogin,
  updatePlatformPassword,
  updateTenantFields,
} from '@/modules/platform/platform.db';
import {
  ICreateOwnerPayload,
  ICreateTenantPayload,
  ITenantSummary,
  PASSWORD_MIN_LENGTH,
  PlatformActions,
  PlatformErrors,
  SALT_ROUNDS,
  TENANT_UPDATABLE_FIELDS,
  TenantStatuses,
} from '@/modules/platform/types';

const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

const requireTenantRow = async (id: string): Promise<ITenantSummary> => {
  const tenant = await selectTenantById(id);

  if (!tenant) {
    throw new AppError(PlatformErrors.tenantMissing, HttpStatus.notFound);
  }

  return tenant;
};

export const changePlatformPassword = async (
  actor: IPlatformContext,
  rawCurrent: unknown,
  rawNext: unknown,
  ip: string | null,
): Promise<{ changed: boolean }> => {
  const current = typeof rawCurrent === 'string' ? rawCurrent : '';
  const next = typeof rawNext === 'string' ? rawNext : '';

  if (next.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(PlatformErrors.passwordTooShort, HttpStatus.badRequest);
  }

  if (next === current) {
    throw new AppError(PlatformErrors.passwordSame, HttpStatus.badRequest);
  }

  const user = await selectPlatformUserById(actor.id);

  if (!user) {
    throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
  }

  const matched = await bcrypt.compare(current, user.password_hash);

  if (!matched) {
    throw new AppError(PlatformErrors.currentPasswordWrong, HttpStatus.badRequest);
  }

  await updatePlatformPassword(user.id, await bcrypt.hash(next, SALT_ROUNDS));
  await insertAuditEntry({
    actorId: actor.id,
    actorLogin: actor.login,
    action: PlatformActions.passwordUpdate,
    ip,
  });

  return { changed: true };
};

export const ensurePlatformAdmin = async (): Promise<void> => {
  const login = pickString(Env.platform.adminLogin);
  const password = pickString(Env.platform.adminPassword);

  if (!login || !password) {
    return;
  }

  const existing = await selectPlatformUserByLogin(login);

  if (existing) {
    return;
  }

  await insertPlatformUser(
    login,
    await bcrypt.hash(password, SALT_ROUNDS),
    pickString(Env.platform.adminName, login),
    PlatformRoles.superadmin,
  );
};

export const authenticatePlatform = async (
  rawLogin: unknown,
  rawPassword: unknown,
  ip: string | null,
): Promise<{ token: string; login: string; name: string; role: string }> => {
  const login = pickString(rawLogin);
  const password = typeof rawPassword === 'string' ? rawPassword : '';
  const user = login ? await selectPlatformUserByLogin(login) : null;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError(PlatformErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  if (user.status !== TenantStatuses.active) {
    throw new AppError(PlatformErrors.accountDisabled, HttpStatus.forbidden);
  }

  const context: IPlatformContext = {
    id: user.id,
    login: user.login,
    role: user.role === PlatformRoles.superadmin ? PlatformRoles.superadmin : PlatformRoles.operator,
    scope: 'platform',
  };

  await touchPlatformLogin(user.id);
  await insertAuditEntry({
    actorId: user.id,
    actorLogin: user.login,
    action: PlatformActions.login,
    ip,
  });

  return {
    token: jwt.sign(context, Env.platform.jwtSecret, { expiresIn: Env.platform.jwtExpiresIn as any }),
    login: user.login,
    name: user.name,
    role: context.role,
  };
};

export const signIn = async (
  rawLogin: unknown,
  rawPassword: unknown,
  ip: string | null,
): Promise<Record<string, unknown>> => {
  const login = pickString(rawLogin);
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!login || !password) {
    throw new AppError(PlatformErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  const platformUser = await selectPlatformUserByLogin(login);

  if (platformUser) {
    return { scope: 'platform', ...(await authenticatePlatform(login, password, ip)) };
  }

  const entry = await selectStaffLogin(login);

  if (!entry) {
    throw new AppError(PlatformErrors.invalidCredentials, HttpStatus.unauthorized);
  }

  const tenant = await requireTenantRow(entry.tenant_id);

  if (tenant.status !== TenantStatuses.active) {
    throw new AppError(PlatformErrors.accountDisabled, HttpStatus.forbidden);
  }

  const session = await loginWithPassword(
    { id: tenant.id, key: tenant.key, name: tenant.name, status: tenant.status },
    login,
    password,
  );

  return { scope: 'shop', tenantKey: tenant.key, tenantName: tenant.name, ...session };
};

export const listAuditActions = async (): Promise<string[]> => selectAuditActions();

export const listAudit = async (
  query: Record<string, unknown>,
  page: number,
  limit: number,
  offset: number,
): Promise<IListResult<Record<string, unknown>>> => {
  const filters = {
    action: pickString(query.action) || null,
    tenantKey: pickString(query.tenantKey) || null,
    search: pickString(query.search) || null,
  };
  const { items, total } = await selectAuditEntries(filters, limit, offset);

  return {
    items: items.map((row) => ({
      id: row.id,
      actorLogin: row.actor_login,
      action: row.action,
      tenantKey: row.tenant_key,
      payload: row.payload ?? {},
      ip: row.ip,
      createdAt: row.created_at,
    })),
    total,
    page,
    limit,
  };
};

export const listTenants = async (
  page: number,
  limit: number,
  offset: number,
): Promise<IListResult<ITenantSummary>> => ({
  items: await selectTenants(limit, offset),
  total: await countTenants(),
  page,
  limit,
});

export const createTenant = async (
  actor: IPlatformContext,
  payload: ICreateTenantPayload,
  ip: string | null,
): Promise<ITenantSummary> => {
  const key = pickString(payload.key).toLowerCase();
  const name = pickString(payload.name);

  if (!KEY_PATTERN.test(key)) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  if (await existsTenantKey(key)) {
    throw new AppError(PlatformErrors.keyTaken, HttpStatus.conflict);
  }

  const tenant = await insertTenant(
    key,
    name,
    pickString(payload.vertical, 'universal'),
    pickString(payload.plan, 'start'),
    pickString(payload.bundleId) || null,
  );

  await insertDefaultConfig(tenant.id);
  await applyVerticalPreset(tenant.id, tenant.vertical);
  await insertAuditEntry({
    actorId: actor.id,
    actorLogin: actor.login,
    action: PlatformActions.tenantCreate,
    tenantId: tenant.id,
    payload: { key, name },
    ip,
  });

  const ownerLogin = pickString(payload.ownerLogin);
  const ownerPassword = typeof payload.ownerPassword === 'string' ? payload.ownerPassword : '';

  if (ownerLogin && ownerPassword) {
    await createTenantOwner(
      actor,
      tenant.id,
      {
        name: pickString(payload.ownerName, name),
        password: ownerPassword,
        email: ownerLogin.includes('@') ? ownerLogin : undefined,
        phone: ownerLogin.includes('@') ? undefined : ownerLogin,
      },
      ip,
    );
  }

  return tenant;
};

export const updateTenant = async (
  actor: IPlatformContext,
  id: string,
  payload: Record<string, unknown>,
  ip: string | null,
): Promise<ITenantSummary> => {
  const tenant = await requireTenantRow(id);
  const patch: Record<string, unknown> = {};

  TENANT_UPDATABLE_FIELDS.forEach((field) => {
    const value = payload[field];

    if (typeof value === 'string' && value.trim().length > 0) {
      patch[field] = value.trim();
    }
  });

  if (Object.keys(patch).length === 0) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  await updateTenantFields(id, patch);
  invalidateTenantCache(tenant.key);
  await insertAuditEntry({
    actorId: actor.id,
    actorLogin: actor.login,
    action: PlatformActions.tenantUpdate,
    tenantId: id,
    payload: patch,
    ip,
  });

  return requireTenantRow(id);
};

export const deactivateTenant = async (
  actor: IPlatformContext,
  id: string,
  ip: string | null,
): Promise<ITenantSummary> => {
  const tenant = await requireTenantRow(id);

  await setTenantStatus(id, TenantStatuses.disabled);
  invalidateTenantCache(tenant.key);
  await insertAuditEntry({
    actorId: actor.id,
    actorLogin: actor.login,
    action: PlatformActions.tenantDeactivate,
    tenantId: id,
    payload: { key: tenant.key },
    ip,
  });

  return requireTenantRow(id);
};

export const activateTenant = async (
  actor: IPlatformContext,
  id: string,
  ip: string | null,
): Promise<ITenantSummary> => {
  const tenant = await requireTenantRow(id);

  await setTenantStatus(id, TenantStatuses.active);
  invalidateTenantCache(tenant.key);
  await insertAuditEntry({
    actorId: actor.id,
    actorLogin: actor.login,
    action: PlatformActions.tenantActivate,
    tenantId: id,
    payload: { key: tenant.key },
    ip,
  });

  return requireTenantRow(id);
};

export const createTenantOwner = async (
  actor: IPlatformContext,
  tenantId: string,
  payload: ICreateOwnerPayload,
  ip: string | null,
): Promise<{ id: string }> => {
  const tenant = await requireTenantRow(tenantId);
  const phone = pickString(payload.phone) || null;
  const email = pickString(payload.email) || null;
  const password = typeof payload.password === 'string' ? payload.password : '';

  if ((!phone && !email) || password.length < 6) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  const directoryLogin = (email ?? phone) as string;

  if (await existsStaffLogin(directoryLogin)) {
    throw new AppError(PlatformErrors.loginTaken, HttpStatus.conflict);
  }

  const ownerId = await insertTenantOwner(
    tenant.id,
    await bcrypt.hash(password, SALT_ROUNDS),
    pickString(payload.name, tenant.name),
    UserRoles.owner,
    phone,
    email,
  );

  await insertStaffLogin(directoryLogin, tenant.id, ownerId);

  if (email && phone) {
    await insertStaffLogin(phone, tenant.id, ownerId);
  }

  await insertAuditEntry({
    actorId: actor.id,
    actorLogin: actor.login,
    action: PlatformActions.ownerCreate,
    tenantId: tenant.id,
    payload: { ownerId, phone, email },
    ip,
  });

  return { id: ownerId };
};
