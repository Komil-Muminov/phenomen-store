import { ErrorMessages, HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import {
  deletePromotionById,
  existsPromotionCode,
  insertPromotion,
  selectPromotionById,
  selectPromotionPage,
  updatePromotionFields,
} from '@/modules/promotion/promotion.db';
import {
  CODE_PATTERN,
  IPromotionFilters,
  IPromotionInput,
  IPromotionRow,
  PromotionDefaults,
  PromotionErrors,
  PromotionKinds,
} from '@/modules/promotion/types';
import { PlanResources, ensurePlanLimit } from '@/modules/plans';

const KINDS: string[] = Object.values(PromotionKinds);

const mapPromotion = (row: IPromotionRow) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  kind: row.kind,
  minTotal: Number(row.conditions?.minTotal ?? 0),
  percent: Number(row.actions?.percent ?? 0),
  amount: Number(row.actions?.amount ?? 0),
  priority: row.priority,
  usageLimit: row.usage_limit,
  usageCount: row.usage_count,
  startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
  endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
  isActive: row.is_active !== false,
});

const pickNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const pickDate = (value: unknown): string | null => {
  const raw = pickString(value);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  return date.toISOString();
};

const buildInput = (payload: Record<string, unknown>): IPromotionInput => {
  const name = pickString(payload.name).slice(0, PromotionDefaults.nameMaxLength);
  const kind = pickString(payload.kind, PromotionKinds.cartPercent);
  const rawCode = pickString(payload.code).toUpperCase();
  const percent = pickNumber(payload.percent);
  const amount = pickNumber(payload.amount);
  const usageLimit = payload.usageLimit === null || payload.usageLimit === undefined
    ? null
    : pickNumber(payload.usageLimit);
  const startsAt = pickDate(payload.startsAt);
  const endsAt = pickDate(payload.endsAt);

  if (!name) {
    throw new AppError(PromotionErrors.nameRequired, HttpStatus.badRequest);
  }

  if (!KINDS.includes(kind)) {
    throw new AppError(PromotionErrors.kindInvalid, HttpStatus.badRequest);
  }

  if (rawCode && !CODE_PATTERN.test(rawCode)) {
    throw new AppError(PromotionErrors.codeInvalid, HttpStatus.badRequest);
  }

  if (kind === PromotionKinds.cartPercent
    && (percent <= 0 || percent > PromotionDefaults.percentMax)) {
    throw new AppError(PromotionErrors.percentInvalid, HttpStatus.badRequest);
  }

  if (kind === PromotionKinds.cartFixed && amount <= 0) {
    throw new AppError(PromotionErrors.amountInvalid, HttpStatus.badRequest);
  }

  if (usageLimit !== null && usageLimit <= 0) {
    throw new AppError(PromotionErrors.limitInvalid, HttpStatus.badRequest);
  }

  if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
    throw new AppError(PromotionErrors.datesInvalid, HttpStatus.badRequest);
  }

  return {
    code: rawCode || null,
    name,
    kind,
    minTotal: pickNumber(payload.minTotal),
    percent,
    amount,
    priority: pickNumber(payload.priority, PromotionDefaults.priority),
    usageLimit,
    startsAt,
    endsAt,
    isActive: payload.isActive !== false,
  };
};

const assertCodeFree = async (
  tenant: ITenantContext,
  code: string | null,
  excludeId: string | null,
): Promise<void> => {
  if (code && await existsPromotionCode(tenant.id, code, excludeId)) {
    throw new AppError(PromotionErrors.codeTaken, HttpStatus.conflict);
  }
};

export const listPromotions = async (
  tenant: ITenantContext,
  filters: IPromotionFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectPromotionPage(tenant.id, filters, limit, offset);

  return { items: items.map(mapPromotion), total, page, limit };
};

export const createPromotion = async (
  tenant: ITenantContext,
  payload: Record<string, unknown>,
) => {
  const input = buildInput(payload);

  await assertCodeFree(tenant, input.code, null);
  await ensurePlanLimit(tenant, PlanResources.promotions);

  return mapPromotion(await insertPromotion(tenant.id, input));
};

export const updatePromotion = async (
  tenant: ITenantContext,
  id: string,
  payload: Record<string, unknown>,
) => {
  const current = await selectPromotionById(tenant.id, id);

  if (!current) {
    throw new AppError(ErrorMessages.notFound, HttpStatus.notFound);
  }

  const input = buildInput(payload);

  await assertCodeFree(tenant, input.code, id);

  return mapPromotion(await updatePromotionFields(tenant.id, id, input));
};

export const removePromotion = async (tenant: ITenantContext, id: string) => {
  const removed = await deletePromotionById(tenant.id, id);

  if (removed === 0) {
    throw new AppError(ErrorMessages.notFound, HttpStatus.notFound);
  }

  return { removed: true };
};
