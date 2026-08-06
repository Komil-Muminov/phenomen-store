import { tenantQuery } from '@/shared/db';
import { IBannerRow, ISectionRow } from '@/modules/storefront/types';

export const selectSections = async (tenantId: string): Promise<ISectionRow[]> => tenantQuery<ISectionRow>(
  tenantId,
  `SELECT id, type, title, position, params
   FROM storefront_sections
   WHERE tenant_id = $1 AND is_active
   ORDER BY position`,
  [tenantId],
);

export const selectBanners = async (tenantId: string): Promise<IBannerRow[]> => tenantQuery<IBannerRow>(
  tenantId,
  `SELECT id, image_url, title, subtitle, action_type, action_value
   FROM banners
   WHERE tenant_id = $1 AND is_active
     AND (starts_at IS NULL OR starts_at <= now())
     AND (ends_at IS NULL OR ends_at >= now())
   ORDER BY position`,
  [tenantId],
);
