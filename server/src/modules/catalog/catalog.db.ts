import { tenantQuery, withTenant } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import {
  DemoProducts,
  DemoSizes,
  ICategoryRow,
  IExportRow,
  IManagedProductFilters,
  IProductRow,
  IProductSearchParams,
  IStockFilters,
  ProductSortSql,
  SearchLanguage,
} from '@/modules/catalog/types';

const PRODUCT_COLUMNS = `
  p.id, p.slug, p.name, p.description, p.brand, p.category_id, p.product_type, p.unit,
         p.base_price, p.old_price, p.currency, p.attributes, p.rating, p.reviews_count, p.created_at,
         COALESCE(m.media, ARRAY[]::text[]) AS media,
         COALESCE(v.variants, '[]'::json) AS variants,
         v.min_price,
         COALESCE(v.in_stock, false) AS in_stock,
         p.is_active
`;

const PRODUCT_FROM = `
  FROM products p
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object(
             'id', pv.id, 'sku', pv.sku, 'options', pv.options, 'price', pv.price,
             'old_price', pv.old_price, 'stock', pv.stock, 'is_active', pv.is_active
           ) ORDER BY pv.sku) AS variants,
           MIN(pv.price) AS min_price,
           BOOL_OR(pv.stock > pv.reserved) AS in_stock
    FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.is_active
  ) v ON true
  LEFT JOIN LATERAL (
    SELECT array_agg(pm.url ORDER BY pm.position) AS media
    FROM product_media pm
    WHERE pm.product_id = p.id
  ) m ON true
`;

export const selectCategories = async (tenantId: string): Promise<ICategoryRow[]> => tenantQuery<ICategoryRow>(
  tenantId,
  `SELECT id, parent_id, slug, name, image_url, position
   FROM categories
   WHERE tenant_id = $1 AND is_active
   ORDER BY position, name`,
  [tenantId],
);

const CATEGORY_COLUMNS = 'id, parent_id, slug, name, description, image_url, position, is_active';

export const selectManagedCategories = async (tenantId: string): Promise<ICategoryRow[]> => (
  tenantQuery<ICategoryRow>(
    tenantId,
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE tenant_id = $1 ORDER BY position, name`,
    [tenantId],
  )
);

export const selectCategoryById = async (
  tenantId: string,
  id: string,
): Promise<ICategoryRow | null> => {
  const rows = await tenantQuery<ICategoryRow>(
    tenantId,
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const existsCategorySlug = async (tenantId: string, slug: string): Promise<boolean> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'SELECT id FROM categories WHERE tenant_id = $1 AND slug = $2 LIMIT 1',
    [tenantId, slug],
  );

  return rows.length > 0;
};

export const insertCategory = async (
  tenantId: string,
  slug: string,
  name: string,
  parentId: string | null,
  imageUrl: string | null,
  position: number,
): Promise<{ id: string }> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `INSERT INTO categories (tenant_id, slug, name, parent_id, image_url, position)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [tenantId, slug, name, parentId, imageUrl, position],
  );

  return rows[0];
};

export const updateCategoryFields = async (
  tenantId: string,
  id: string,
  name: string | null,
  parentId: string | null,
  imageUrl: string | null,
  position: number | null,
  isActive: boolean | null,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `UPDATE categories
     SET name = COALESCE($3, name),
         parent_id = $4,
         image_url = COALESCE($5, image_url),
         position = COALESCE($6, position),
         is_active = COALESCE($7, is_active)
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id, name, parentId, imageUrl, position, isActive],
  );
};

export const countCategoryProducts = async (tenantId: string, id: string): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    'SELECT COUNT(*)::text AS total FROM products WHERE tenant_id = $1 AND category_id = $2',
    [tenantId, id],
  );

  return Number(rows[0]?.total ?? 0);
};

export const countChildCategories = async (tenantId: string, id: string): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    'SELECT COUNT(*)::text AS total FROM categories WHERE tenant_id = $1 AND parent_id = $2',
    [tenantId, id],
  );

  return Number(rows[0]?.total ?? 0);
};

export const deleteCategoryById = async (tenantId: string, id: string): Promise<void> => {
  await tenantQuery(
    tenantId,
    'DELETE FROM categories WHERE tenant_id = $1 AND id = $2',
    [tenantId, id],
  );
};

const buildFilters = (tenantId: string, params: IProductSearchParams) => {
  const values: unknown[] = [tenantId];
  const conditions: string[] = ['p.tenant_id = $1', 'p.is_active'];

  if (params.query) {
    values.push(params.query);
    conditions.push(`to_tsvector('${SearchLanguage}', p.name || ' ' || COALESCE(p.description, ''))
      @@ plainto_tsquery('${SearchLanguage}', $${values.length})`);
  }

  if (params.categoryId) {
    values.push(params.categoryId);
    conditions.push(`p.category_id = $${values.length}`);
  }

  if (params.minPrice !== null) {
    values.push(params.minPrice);
    conditions.push(`p.base_price >= $${values.length}`);
  }

  if (params.maxPrice !== null) {
    values.push(params.maxPrice);
    conditions.push(`p.base_price <= $${values.length}`);
  }

  Object.entries(params.options).forEach(([code, optionValues]) => {
    values.push(JSON.stringify(optionValues.map((value) => ({ [code]: value }))));
    conditions.push(`EXISTS (
      SELECT 1 FROM product_variants pvf
      WHERE pvf.product_id = p.id AND pvf.is_active
        AND pvf.options @> ANY (SELECT jsonb_array_elements($${values.length}::jsonb))
    )`);
  });

  return { where: conditions.join(' AND '), values };
};

export const selectProducts = async (
  tenantId: string,
  params: IProductSearchParams,
): Promise<{ items: IProductRow[]; total: number }> => {
  const { where, values } = buildFilters(tenantId, params);
  const order = ProductSortSql[params.sort] ?? ProductSortSql.popular;

  return withTenant(tenantId, async (client) => {
    const rows = await client.query<TCounted<IProductRow>>(
      `SELECT ${PRODUCT_COLUMNS}, COUNT(*) OVER()::text AS total_count ${PRODUCT_FROM} WHERE ${where}
       ORDER BY ${order} NULLS LAST LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, params.limit, params.offset],
    );

    return splitTotal(rows.rows);
  });
};

const MANAGED_PRODUCTS_FILTER = `
  WHERE p.tenant_id = $1
    AND ($2::text IS NULL OR p.name ILIKE $2 OR p.brand ILIKE $2 OR p.slug ILIKE $2)
    AND ($3::uuid IS NULL OR p.category_id = $3)
    AND ($4::boolean IS NULL OR p.is_active = $4)
`;

export const selectManagedProducts = async (
  tenantId: string,
  filters: IManagedProductFilters,
  limit: number,
  offset: number,
): Promise<{ items: IProductRow[]; total: number }> => withTenant(tenantId, async (client) => {
  const scope = [tenantId, filters.search, filters.categoryId, filters.isActive];
  const rows = await client.query<TCounted<IProductRow>>(
    `SELECT ${PRODUCT_COLUMNS}, COUNT(*) OVER()::text AS total_count ${PRODUCT_FROM} ${MANAGED_PRODUCTS_FILTER}
     ORDER BY p.created_at DESC LIMIT $5 OFFSET $6`,
    [...scope, limit, offset],
  );

  return splitTotal(rows.rows);
});

const PRODUCT_WRITE_COLUMNS: Record<string, string> = {
  name: 'name',
  description: 'description',
  brand: 'brand',
  basePrice: 'base_price',
  oldPrice: 'old_price',
  categoryId: 'category_id',
  isActive: 'is_active',
  unit: 'unit',
};

export const insertProduct = async (
  tenantId: string,
  slug: string,
  name: string,
  basePrice: number,
  categoryId: string | null,
  description: string | null,
  brand: string | null,
  attributes: Record<string, unknown> = {},
): Promise<{ id: string }> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `INSERT INTO products
       (tenant_id, slug, name, base_price, category_id, description, brand, attributes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     RETURNING id`,
    [tenantId, slug, name, basePrice, categoryId, description, brand, JSON.stringify(attributes)],
  );

  return rows[0];
};

export const updateProductAttributes = async (
  tenantId: string,
  id: string,
  attributes: Record<string, unknown>,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `UPDATE products SET attributes = $3::jsonb, updated_at = now()
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id, JSON.stringify(attributes)],
  );
};

export interface IVariantInput {
  sku: string;
  options: Record<string, string>;
  price: number;
  oldPrice: number | null;
  stock: number;
}

export const replaceVariants = async (
  tenantId: string,
  productId: string,
  variants: IVariantInput[],
): Promise<void> => {
  await withTenant(tenantId, async (client) => {
    const keep = variants.map((variant) => variant.sku);

    await client.query(
      `DELETE FROM product_variants
       WHERE tenant_id = $1 AND product_id = $2 AND NOT (sku = ANY($3::text[]))`,
      [tenantId, productId, keep],
    );

    for (const variant of variants) {
      await client.query(
        `INSERT INTO product_variants
           (tenant_id, product_id, sku, options, price, old_price, stock)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
         ON CONFLICT (tenant_id, sku) DO UPDATE
           SET options = $4::jsonb, price = $5, old_price = $6, stock = $7, is_active = true`,
        [
          tenantId,
          productId,
          variant.sku,
          JSON.stringify(variant.options),
          variant.price,
          variant.oldPrice,
          variant.stock,
        ],
      );
    }
  });
};

export const replaceMedia = async (
  tenantId: string,
  productId: string,
  urls: string[],
): Promise<void> => {
  await withTenant(tenantId, async (client) => {
    await client.query(
      'DELETE FROM product_media WHERE tenant_id = $1 AND product_id = $2',
      [tenantId, productId],
    );

    for (let index = 0; index < urls.length; index += 1) {
      await client.query(
        `INSERT INTO product_media (tenant_id, product_id, url, kind, position)
         VALUES ($1, $2, $3, 'image', $4)`,
        [tenantId, productId, urls[index], index * 10],
      );
    }
  });
};

export interface IStockRow {
  id: string;
  sku: string;
  options: Record<string, string>;
  stock: number;
  price: string;
  product_id: string;
  product_name: string;
  is_active: boolean;
}

const STOCK_FILTER = `
  FROM product_variants v
  JOIN products p ON p.id = v.product_id AND p.tenant_id = v.tenant_id
  WHERE v.tenant_id = $1
    AND ($2::text IS NULL OR p.name ILIKE $2 OR v.sku ILIKE $2)
    AND ($3::boolean IS NOT TRUE OR v.stock = 0)
`;

export const selectStockRows = async (
  tenantId: string,
  filters: IStockFilters,
  limit: number,
  offset: number,
): Promise<{ items: IStockRow[]; total: number }> => withTenant(tenantId, async (client) => {
  const scope = [tenantId, filters.search, filters.onlyEmpty];
  const rows = await client.query<TCounted<IStockRow>>(
    `SELECT v.id, v.sku, v.options, v.stock, v.price::text, v.is_active,
            p.id AS product_id, p.name AS product_name,
            COUNT(*) OVER()::text AS total_count
     ${STOCK_FILTER}
     ORDER BY p.name, v.sku
     LIMIT $4 OFFSET $5`,
    [...scope, limit, offset],
  );

  return splitTotal(rows.rows);
});

export const selectProductVariants = async (
  tenantId: string,
  productId: string,
): Promise<IVariantInput[]> => {
  const rows = await tenantQuery<{
    sku: string;
    options: Record<string, string>;
    price: string;
    old_price: string | null;
    stock: number;
  }>(
    tenantId,
    `SELECT sku, options, price::text, old_price::text, stock
     FROM product_variants WHERE tenant_id = $1 AND product_id = $2`,
    [tenantId, productId],
  );

  return rows.map((row) => ({
    sku: row.sku,
    options: row.options ?? {},
    price: Number(row.price),
    oldPrice: row.old_price === null ? null : Number(row.old_price),
    stock: row.stock,
  }));
};

export const updateVariantStock = async (
  tenantId: string,
  variantId: string,
  stock: number,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    'UPDATE product_variants SET stock = $3 WHERE tenant_id = $1 AND id = $2',
    [tenantId, variantId, stock],
  );
};

export const updateProductFields = async (
  tenantId: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> => {
  const entries = Object.entries(patch).filter(([field]) => PRODUCT_WRITE_COLUMNS[field]);

  if (entries.length === 0) {
    return;
  }

  const assignments = entries.map(
    ([field], index) => `${PRODUCT_WRITE_COLUMNS[field]} = $${index + 3}`,
  );

  await tenantQuery(
    tenantId,
    `UPDATE products SET ${assignments.join(', ')}, updated_at = now()
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id, ...entries.map(([, value]) => value)],
  );
};

export const existsProductSlug = async (tenantId: string, slug: string): Promise<boolean> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'SELECT id FROM products WHERE tenant_id = $1 AND slug = $2 LIMIT 1',
    [tenantId, slug],
  );

  return rows.length > 0;
};

export const selectProductById = async (tenantId: string, id: string): Promise<IProductRow | null> => {
  const rows = await tenantQuery<IProductRow>(
    tenantId,
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_FROM} WHERE p.tenant_id = $1 AND p.id = $2 AND p.is_active LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const selectManagedProductBySlug = async (
  tenantId: string,
  slug: string,
): Promise<IProductRow | null> => {
  const rows = await tenantQuery<IProductRow>(
    tenantId,
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_FROM} WHERE p.tenant_id = $1 AND p.slug = $2 LIMIT 1`,
    [tenantId, slug],
  );

  return rows[0] ?? null;
};

export const selectManagedProductById = async (
  tenantId: string,
  id: string,
): Promise<IProductRow | null> => {
  const rows = await tenantQuery<IProductRow>(
    tenantId,
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_FROM} WHERE p.tenant_id = $1 AND p.id = $2 LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const selectOptionFacets = async (
  tenantId: string,
  categoryId: string | null,
): Promise<{ code: string; value: string; total: string }[]> => tenantQuery(
  tenantId,
  `SELECT option_pair.key AS code, option_pair.value AS value, COUNT(DISTINCT p.id)::text AS total
   FROM products p
   JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active
   JOIN LATERAL jsonb_each_text(pv.options) AS option_pair(key, value) ON true
   WHERE p.tenant_id = $1 AND p.is_active AND ($2::uuid IS NULL OR p.category_id = $2)
   GROUP BY option_pair.key, option_pair.value
   ORDER BY option_pair.key, option_pair.value`,
  [tenantId, categoryId],
);

export const seedDemoCatalog = async (tenantId: string): Promise<void> => {
  await withTenant(tenantId, async (client) => {
    for (const demo of DemoProducts) {
      const product = await client.query<{ id: string }>(
        `INSERT INTO products (tenant_id, category_id, slug, name, description, brand, base_price, old_price, attributes)
         SELECT $1, c.id, $2, $3, $4, $5, $6, $7, $8::jsonb
         FROM categories c WHERE c.tenant_id = $1 AND c.slug = $9
         ON CONFLICT (tenant_id, slug) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [
          tenantId,
          demo.slug,
          demo.name,
          `${demo.name}. ${Object.values(demo.attributes).join(', ')}.`,
          demo.brand,
          demo.price,
          demo.oldPrice,
          JSON.stringify(demo.attributes),
          demo.category,
        ],
      );

      const productId = product.rows[0]?.id;

      if (!productId) {
        continue;
      }

      await client.query(
        `DELETE FROM product_media WHERE tenant_id = $1 AND product_id = $2`,
        [tenantId, productId],
      );

      for (let i = 0; i < (demo.media || []).length; i++) {
        await client.query(
          `INSERT INTO product_media (tenant_id, product_id, url, position)
           VALUES ($1, $2, $3, $4)`,
          [tenantId, productId, demo.media[i], i],
        );
      }

      for (const color of demo.colors) {
        for (const size of DemoSizes) {
          await client.query(
            `INSERT INTO product_variants (tenant_id, product_id, sku, options, price, old_price, stock)
             VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
             ON CONFLICT (tenant_id, sku) DO NOTHING`,
            [
              tenantId,
              productId,
              `${demo.slug}-${color}-${size}`.toUpperCase(),
              JSON.stringify({ size, color }),
              demo.price,
              demo.oldPrice,
              10,
            ],
          );
        }
      }
    }

    const unmappedProducts = await client.query<{ id: string }>(
      `SELECT p.id FROM products p
       WHERE p.tenant_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM product_media pm WHERE pm.product_id = p.id AND pm.url NOT LIKE '%placehold%'
         )`,
      [tenantId],
    );

    for (const p of unmappedProducts.rows) {
      await client.query(
        `DELETE FROM product_media WHERE tenant_id = $1 AND product_id = $2`,
        [tenantId, p.id],
      );
      await client.query(
        `INSERT INTO product_media (tenant_id, product_id, url, position)
         VALUES ($1, $2, $3, 0)`,
        [
          tenantId,
          p.id,
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
        ],
      );
    }
  });
};

export const bulkSetProductFields = async (
  tenantId: string,
  ids: string[],
  isActive: boolean | null,
  categoryId: string | null,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `UPDATE products
     SET is_active = COALESCE($3, is_active),
         category_id = COALESCE($4, category_id),
         updated_at = now()
     WHERE tenant_id = $1 AND id = ANY($2::uuid[])
     RETURNING id`,
    [tenantId, ids, isActive, categoryId],
  );

  return rows.length;
};

export const selectProductsForExport = async (
  tenantId: string,
): Promise<IExportRow[]> => tenantQuery<IExportRow>(
  tenantId,
  `SELECT p.name, p.slug, p.brand, p.description, p.unit,
          p.base_price::text AS base_price,
          p.old_price::text AS old_price,
          c.name AS category,
          COALESCE(m.media, ARRAY[]::text[]) AS media
   FROM products p
   LEFT JOIN categories c ON c.id = p.category_id AND c.tenant_id = p.tenant_id
   LEFT JOIN LATERAL (
     SELECT array_agg(pm.url ORDER BY pm.position) AS media
     FROM product_media pm
     WHERE pm.product_id = p.id
   ) m ON true
   WHERE p.tenant_id = $1
   ORDER BY p.created_at DESC`,
  [tenantId],
);
