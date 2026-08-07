export const CATALOG_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_tenant_slug_uniq ON categories(tenant_id, slug);
CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories(tenant_id, parent_id, position);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  product_type TEXT NOT NULL DEFAULT 'variant',
  unit TEXT NOT NULL DEFAULT 'piece',
  base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  old_price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'TJS',
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 20,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS products_tenant_slug_uniq ON products(tenant_id, slug);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(tenant_id, category_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS products_attributes_idx ON products USING GIN (attributes);
CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN (to_tsvector('russian', name || ' ' || COALESCE(description, '')));

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  barcode TEXT,
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  old_price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  weight_grams INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_tenant_sku_uniq ON product_variants(tenant_id, sku);
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS product_variants_options_idx ON product_variants USING GIN (options);

CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image',
  option_value TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS product_media_product_idx ON product_media(tenant_id, product_id, position);

CREATE TABLE IF NOT EXISTS attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  value_type TEXT NOT NULL DEFAULT 'string',
  is_variant_option BOOLEAN NOT NULL DEFAULT false,
  is_filterable BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  values JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS attributes_tenant_code_uniq ON attributes(tenant_id, code);

CREATE TABLE IF NOT EXISTS favorites (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(tenant_id, product_id);
`;
