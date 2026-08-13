import { tenantQuery } from '@/shared/db';
import { TPlanResource } from '@/modules/plans/types';

const RESOURCE_TABLES: Record<TPlanResource, string> = {
  products: 'products',
  banners: 'banners',
  promotions: 'promotions',
  categories: 'categories',
};

export const countResource = async (
  tenantId: string,
  resource: TPlanResource,
): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    `SELECT COUNT(*)::text AS total FROM ${RESOURCE_TABLES[resource]} WHERE tenant_id = $1`,
    [tenantId],
  );

  return Number(rows[0]?.total ?? 0);
};

export const countResources = async (
  tenantId: string,
  resources: TPlanResource[],
): Promise<Record<string, number>> => {
  const selects = resources
    .map((resource) => `(SELECT COUNT(*) FROM ${RESOURCE_TABLES[resource]} WHERE tenant_id = $1)::text AS ${resource}`)
    .join(', ');
  const rows = await tenantQuery<Record<string, string>>(
    tenantId,
    `SELECT ${selects}`,
    [tenantId],
  );
  const row = rows[0] ?? {};

  return resources.reduce<Record<string, number>>((acc, resource) => {
    acc[resource] = Number(row[resource] ?? 0);

    return acc;
  }, {});
};
