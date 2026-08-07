import { tenantQuery } from '@/shared/db';
import { IBannerInput, IBannerRow } from '@/modules/banner/types';

const BANNER_COLUMNS = `
  id, image_url, title, subtitle, action_type, action_value,
  position, starts_at, ends_at, is_active
`;

export const selectManagedBanners = async (tenantId: string): Promise<IBannerRow[]> => (
  tenantQuery<IBannerRow>(
    tenantId,
    `SELECT ${BANNER_COLUMNS} FROM banners WHERE tenant_id = $1 ORDER BY position, id`,
    [tenantId],
  )
);

export const selectBannerById = async (
  tenantId: string,
  id: string,
): Promise<IBannerRow | null> => {
  const rows = await tenantQuery<IBannerRow>(
    tenantId,
    `SELECT ${BANNER_COLUMNS} FROM banners WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const insertBanner = async (
  tenantId: string,
  input: IBannerInput,
): Promise<IBannerRow> => {
  const rows = await tenantQuery<IBannerRow>(
    tenantId,
    `INSERT INTO banners
       (tenant_id, image_url, title, subtitle, action_type, action_value,
        position, starts_at, ends_at, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${BANNER_COLUMNS}`,
    [
      tenantId,
      input.imageUrl,
      input.title,
      input.subtitle,
      input.actionType,
      input.actionValue,
      input.position,
      input.startsAt,
      input.endsAt,
      input.isActive,
    ],
  );

  return rows[0];
};

export const updateBannerFields = async (
  tenantId: string,
  id: string,
  input: IBannerInput,
): Promise<IBannerRow> => {
  const rows = await tenantQuery<IBannerRow>(
    tenantId,
    `UPDATE banners
     SET image_url = $3,
         title = $4,
         subtitle = $5,
         action_type = $6,
         action_value = $7,
         position = $8,
         starts_at = $9,
         ends_at = $10,
         is_active = $11
     WHERE tenant_id = $1 AND id = $2
     RETURNING ${BANNER_COLUMNS}`,
    [
      tenantId,
      id,
      input.imageUrl,
      input.title,
      input.subtitle,
      input.actionType,
      input.actionValue,
      input.position,
      input.startsAt,
      input.endsAt,
      input.isActive,
    ],
  );

  return rows[0];
};

export const setBannerActive = async (
  tenantId: string,
  id: string,
  isActive: boolean,
): Promise<IBannerRow> => {
  const rows = await tenantQuery<IBannerRow>(
    tenantId,
    `UPDATE banners SET is_active = $3
     WHERE tenant_id = $1 AND id = $2
     RETURNING ${BANNER_COLUMNS}`,
    [tenantId, id, isActive],
  );

  return rows[0];
};

export const existsTenantCategory = async (tenantId: string, id: string): Promise<boolean> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'SELECT id FROM categories WHERE tenant_id = $1 AND id = $2 LIMIT 1',
    [tenantId, id],
  );

  return rows.length > 0;
};

export const existsTenantProduct = async (tenantId: string, id: string): Promise<boolean> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'SELECT id FROM products WHERE tenant_id = $1 AND id = $2 LIMIT 1',
    [tenantId, id],
  );

  return rows.length > 0;
};

export const ensureCarouselSection = async (
  tenantId: string,
  type: string,
  position: number,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `INSERT INTO storefront_sections (tenant_id, type, title, position, params)
     SELECT $1, $2, NULL, $3, '{"autoplay": true, "interval": 5000}'::jsonb
     WHERE NOT EXISTS (
       SELECT 1 FROM storefront_sections WHERE tenant_id = $1 AND type = $2
     )`,
    [tenantId, type, position],
  );
};

export const activateCarouselSection = async (tenantId: string, type: string): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE storefront_sections SET is_active = true WHERE tenant_id = $1 AND type = $2',
    [tenantId, type],
  );
};
