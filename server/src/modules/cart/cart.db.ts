import { PoolClient } from 'pg';
import { tenantQuery, withTenant } from '@/shared/db';
import { CartStatus, ICartItemRow, ICartOwner, ICartRow, IPromotionRow } from '@/modules/cart/types';

const CART_ITEMS_SQL = `
  SELECT ci.id, ci.variant_id, p.id AS product_id, p.name AS product_name, pv.sku, pv.options,
         ci.quantity::text AS quantity, pv.price::text AS price, pv.old_price::text AS old_price,
         pv.stock, pv.reserved, p.tax_rate::text AS tax_rate,
         (SELECT pm.url FROM product_media pm WHERE pm.product_id = p.id ORDER BY pm.position LIMIT 1) AS media
  FROM cart_items ci
  JOIN product_variants pv ON pv.id = ci.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE ci.tenant_id = $1 AND ci.cart_id = $2
  ORDER BY ci.created_at
`;

const findCart = async (
  client: PoolClient,
  tenantId: string,
  owner: ICartOwner,
): Promise<ICartRow | null> => {
  const result = await client.query<ICartRow>(
    `SELECT id, promo_code
     FROM carts
     WHERE tenant_id = $1 AND status = $2
       AND (($3::uuid IS NOT NULL AND user_id = $3) OR ($3::uuid IS NULL AND guest_key = $4))
     ORDER BY updated_at DESC
     LIMIT 1`,
    [tenantId, CartStatus.active, owner.userId, owner.guestKey],
  );

  return result.rows[0] ?? null;
};

export const ensureCart = async (tenantId: string, owner: ICartOwner): Promise<ICartRow> => withTenant(
  tenantId,
  async (client) => {
    const existing = await findCart(client, tenantId, owner);

    if (existing) {
      return existing;
    }

    const created = await client.query<ICartRow>(
      `INSERT INTO carts (tenant_id, user_id, guest_key)
       VALUES ($1, $2, $3)
       RETURNING id, promo_code`,
      [tenantId, owner.userId, owner.guestKey],
    );

    return created.rows[0];
  },
);

export const selectCartItems = async (tenantId: string, cartId: string): Promise<ICartItemRow[]> => (
  tenantQuery<ICartItemRow>(tenantId, CART_ITEMS_SQL, [tenantId, cartId])
);

export const upsertCartItem = async (
  tenantId: string,
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<void> => {
  await withTenant(tenantId, async (client) => {
    if (quantity <= 0) {
      await client.query(
        'DELETE FROM cart_items WHERE tenant_id = $1 AND cart_id = $2 AND variant_id = $3',
        [tenantId, cartId, variantId],
      );

      return;
    }

    await client.query(
      `INSERT INTO cart_items (tenant_id, cart_id, variant_id, quantity, price_snapshot)
       SELECT $1, $2, $3, $4, pv.price
       FROM product_variants pv
       WHERE pv.tenant_id = $1 AND pv.id = $3 AND pv.is_active
       ON CONFLICT (cart_id, variant_id)
       DO UPDATE SET quantity = EXCLUDED.quantity, price_snapshot = EXCLUDED.price_snapshot`,
      [tenantId, cartId, variantId, quantity],
    );

    await client.query('UPDATE carts SET updated_at = now() WHERE tenant_id = $1 AND id = $2', [tenantId, cartId]);
  });
};

export const clearCartItems = async (tenantId: string, cartId: string): Promise<void> => {
  await withTenant(tenantId, async (client) => {
    await client.query('DELETE FROM cart_items WHERE tenant_id = $1 AND cart_id = $2', [tenantId, cartId]);
    await client.query(
      'UPDATE carts SET promo_code = NULL, updated_at = now() WHERE tenant_id = $1 AND id = $2',
      [tenantId, cartId],
    );
  });
};

export const setCartPromoCode = async (
  tenantId: string,
  cartId: string,
  code: string | null,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE carts SET promo_code = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, cartId, code],
  );
};

export const selectPromotionByCode = async (
  tenantId: string,
  code: string,
): Promise<IPromotionRow | null> => {
  const rows = await tenantQuery<IPromotionRow>(
    tenantId,
    `SELECT id, code, kind, conditions, actions, priority
     FROM promotions
     WHERE tenant_id = $1 AND is_active AND upper(code) = upper($2)
       AND (starts_at IS NULL OR starts_at <= now())
       AND (ends_at IS NULL OR ends_at >= now())
       AND (usage_limit IS NULL OR usage_count < usage_limit)
     ORDER BY priority DESC
     LIMIT 1`,
    [tenantId, code],
  );

  return rows[0] ?? null;
};

export const markCartConverted = async (
  client: PoolClient,
  tenantId: string,
  cartId: string,
): Promise<void> => {
  await client.query(
    'UPDATE carts SET status = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, cartId, CartStatus.converted],
  );
};
