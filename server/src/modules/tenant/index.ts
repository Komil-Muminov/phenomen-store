export { tenantRouter, tenantMiddleware } from '@/modules/tenant/tenant.routes';
export { resolveTenantByKey, getPublicConfig, invalidateTenantCache } from '@/modules/tenant/tenant.service';
export type { ITenantPublicConfig, ITenantRow, ITenantConfigRow } from '@/modules/tenant/types';
