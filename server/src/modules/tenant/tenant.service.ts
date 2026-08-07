import { ErrorMessages, HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, isPlainObject } from '@/shared/utils';
import {
  insertEmptyConfig,
  selectConfigByTenantId,
  selectTenantByKey,
  updateConfigFields,
} from '@/modules/tenant/tenant.db';
import {
  CONFIG_UPDATABLE_FIELDS,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  ITenantPublicConfig,
  ITenantRow,
  TENANT_CACHE_TTL_MS,
} from '@/modules/tenant/types';

const tenantCache = new Map<string, { tenant: ITenantRow; expiresAt: number }>();

const mergeDeep = (
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    const current = result[key];

    result[key] = isPlainObject(current) && isPlainObject(value)
      ? mergeDeep(current, value)
      : value;
  });

  return result;
};

export const resolveTenantByKey = async (key: string): Promise<ITenantContext> => {
  const cached = tenantCache.get(key);
  const tenant = cached && cached.expiresAt > Date.now()
    ? cached.tenant
    : await selectTenantByKey(key);

  if (!tenant) {
    throw new AppError(ErrorMessages.tenantNotFound, HttpStatus.notFound);
  }

  tenantCache.set(key, { tenant, expiresAt: Date.now() + TENANT_CACHE_TTL_MS });

  return { id: tenant.id, key: tenant.key, name: tenant.name, status: tenant.status };
};

export const invalidateTenantCache = (key: string): void => {
  tenantCache.delete(key);
};

export const getPublicConfig = async (tenant: ITenantContext): Promise<ITenantPublicConfig> => {
  const row = (await selectConfigByTenantId(tenant.id)) ?? (await insertEmptyConfig(tenant.id));
  const stored = await selectTenantByKey(tenant.key);

  return {
    id: tenant.id,
    key: tenant.key,
    name: tenant.name,
    vertical: stored?.vertical ?? 'universal',
    brand: mergeDeep({ title: tenant.name, logoUrl: null, slogan: '' }, row.brand),
    theme: mergeDeep(DEFAULT_THEME, row.theme),
    locale: mergeDeep(DEFAULT_LOCALE, row.locale),
    orderRules: mergeDeep({ minOrderTotal: 0, maxItemsPerOrder: 100, guestCheckout: true }, row.order_rules),
    payment: mergeDeep({ methods: ['cash_on_delivery'], provider: 'manual' }, row.payment),
    delivery: mergeDeep({ methods: ['pickup'], freeFrom: null, basePrice: 0 }, row.delivery),
    features: mergeDeep({ favorites: true, reviews: true, promoCodes: false, sizeGuide: false }, row.features),
    contacts: mergeDeep({ phone: '', email: '' }, row.contacts),
  };
};

export const updateTenantConfig = async (
  tenant: ITenantContext,
  payload: Record<string, unknown>,
): Promise<ITenantPublicConfig> => {
  const patch: Record<string, unknown> = {};
  const aliases: Record<string, string> = { order_rules: 'orderRules' };

  CONFIG_UPDATABLE_FIELDS.forEach((field) => {
    const value = payload[field] ?? payload[aliases[field] ?? field];

    if (isPlainObject(value) || Array.isArray(value)) {
      patch[field] = value;
    }
  });

  if (Object.keys(patch).length === 0) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  await insertEmptyConfig(tenant.id);
  await updateConfigFields(tenant.id, patch);
  invalidateTenantCache(tenant.key);

  return getPublicConfig(tenant);
};
