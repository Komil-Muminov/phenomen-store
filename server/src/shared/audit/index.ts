import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/shared/config';
import { query } from '@/shared/db';
import { IAppRequest } from '@/shared/types';

export interface IAuditEntry {
  actorId: string | null;
  actorLogin: string;
  action: string;
  tenantId?: string | null;
  payload?: Record<string, unknown>;
  ip?: string | null;
}

export const ShopActions = {
  productCreate: 'shop.product.create',
  productUpdate: 'shop.product.update',
  productDeactivate: 'shop.product.deactivate',
  productDuplicate: 'shop.product.duplicate',
  productImport: 'shop.product.import',
  stockUpdate: 'shop.stock.update',
  categoryCreate: 'shop.category.create',
  categoryUpdate: 'shop.category.update',
  categoryDelete: 'shop.category.delete',
  attributeCreate: 'shop.attribute.create',
  attributeUpdate: 'shop.attribute.update',
  attributeDelete: 'shop.attribute.delete',
  bannerCreate: 'shop.banner.create',
  bannerUpdate: 'shop.banner.update',
  bannerDeactivate: 'shop.banner.deactivate',
  bannerDelete: 'shop.banner.delete',
  bannerReorder: 'shop.banner.reorder',
  promotionCreate: 'shop.promotion.create',
  promotionUpdate: 'shop.promotion.update',
  promotionDelete: 'shop.promotion.delete',
  orderStatus: 'shop.order.status',
  configUpdate: 'shop.config.update',
} as const;

const PAYLOAD_FIELDS = ['id', 'name', 'title', 'slug', 'status', 'quantity', 'sku'];

const UNKNOWN_ACTOR = 'неизвестный';

export const writeAuditEntry = async (entry: IAuditEntry): Promise<void> => {
  await query(
    `INSERT INTO platform_audit_log (actor_id, actor_login, action, tenant_id, payload, ip)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [
      entry.actorId,
      entry.actorLogin,
      entry.action,
      entry.tenantId ?? null,
      JSON.stringify(entry.payload ?? {}),
      entry.ip ?? null,
    ],
  );
};

const buildPayload = (req: IAppRequest): Record<string, unknown> => {
  const body = typeof req.body === 'object' && req.body !== null
    ? (req.body as Record<string, unknown>)
    : {};
  const payload: Record<string, unknown> = {};

  if (typeof req.params.id === 'string') {
    payload.id = req.params.id;
  }

  PAYLOAD_FIELDS.forEach((field) => {
    const value = body[field];

    if (typeof value === 'string' || typeof value === 'number') {
      payload[field] = value;
    }
  });

  return payload;
};

export const auditMiddleware = (action: string) => (
  req: IAppRequest,
  res: Response,
  next: NextFunction,
): void => {
  res.on('finish', () => {
    if (res.statusCode >= HttpStatus.badRequest) {
      return;
    }

    writeAuditEntry({
      actorId: null,
      actorLogin: req.user?.login ?? req.platform?.login ?? UNKNOWN_ACTOR,
      action,
      tenantId: req.tenant?.id ?? null,
      payload: buildPayload(req),
      ip: req.ip ?? null,
    }).catch((error: unknown) => {
      console.error('[audit] не удалось записать действие', action, error);
    });
  });

  next();
};
