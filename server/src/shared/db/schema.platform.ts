export const PLATFORM_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_logins (
  login TEXT PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_logins_tenant_idx ON staff_logins(tenant_id);

CREATE TABLE IF NOT EXISTS platform_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  actor_login TEXT NOT NULL,
  action TEXT NOT NULL,
  tenant_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_audit_actor_idx ON platform_audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_audit_tenant_idx ON platform_audit_log(tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'open',
  author_login TEXT NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_tickets_tenant_idx
  ON platform_tickets(tenant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS platform_tickets_status_idx
  ON platform_tickets(status, last_message_at DESC);

CREATE TABLE IF NOT EXISTS platform_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES platform_tickets(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_name TEXT,
  text TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_ticket_messages_ticket_idx
  ON platform_ticket_messages(ticket_id, created_at);

CREATE TABLE IF NOT EXISTS platform_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  card JSONB NOT NULL DEFAULT '{}'::jsonb,
  grace_days INTEGER NOT NULL DEFAULT 3,
  auto_block BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  plan TEXT NOT NULL,
  period TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TJS',
  status TEXT NOT NULL DEFAULT 'pending',
  comment TEXT,
  receipt_url TEXT,
  receipt_note TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_note TEXT,
  issued_by TEXT NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_invoices_number_uniq ON platform_invoices(number);
CREATE INDEX IF NOT EXISTS platform_invoices_tenant_idx
  ON platform_invoices(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_invoices_status_idx
  ON platform_invoices(status, created_at DESC);
`;
