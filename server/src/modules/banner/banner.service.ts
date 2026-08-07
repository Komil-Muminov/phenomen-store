import { ErrorMessages, HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { SectionTypes } from '@/modules/storefront';
import {
  activateCarouselSection,
  ensureCarouselSection,
  existsTenantCategory,
  existsTenantProduct,
  insertBanner,
  selectBannerById,
  selectManagedBanners,
  setBannerActive,
  updateBannerFields,
} from '@/modules/banner/banner.db';
import {
  BannerActionTypes,
  BannerDefaults,
  BannerErrors,
  IBannerInput,
  IBannerRow,
  MaxTextLength,
  MaxUrlLength,
  TBannerActionType,
  UrlPattern,
} from '@/modules/banner/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toIso = (value: string | null): string | null => (
  value ? new Date(value).toISOString() : null
);

const mapBanner = (row: IBannerRow) => ({
  id: row.id,
  imageUrl: row.image_url,
  title: row.title,
  subtitle: row.subtitle,
  actionType: row.action_type,
  actionValue: row.action_value,
  position: row.position,
  startsAt: toIso(row.starts_at),
  endsAt: toIso(row.ends_at),
  isActive: row.is_active !== false,
});

const pickUrl = (value: unknown, message: string): string => {
  const url = pickString(value);

  if (!UrlPattern.test(url) || url.length > MaxUrlLength) {
    throw new AppError(message, HttpStatus.badRequest);
  }

  return url;
};

const pickText = (value: unknown): string | null => {
  const text = pickString(value);

  return text ? text.slice(0, MaxTextLength) : null;
};

const resolveImage = (value: unknown, current: IBannerRow | null): string => {
  if (value === undefined && current) {
    return current.image_url;
  }

  if (!pickString(value)) {
    throw new AppError(BannerErrors.imageRequired, HttpStatus.badRequest);
  }

  return pickUrl(value, BannerErrors.imageInvalid);
};

const pickDate = (value: unknown): string | null => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const raw = pickString(value);

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  return parsed.toISOString();
};

const pickPosition = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
};

const pickActionType = (value: unknown): TBannerActionType => {
  const actionType = pickString(value, BannerActionTypes.none);
  const allowed = Object.values(BannerActionTypes) as string[];

  if (!allowed.includes(actionType)) {
    throw new AppError(BannerErrors.actionInvalid, HttpStatus.badRequest);
  }

  return actionType as TBannerActionType;
};

const resolveActionValue = async (
  tenant: ITenantContext,
  actionType: TBannerActionType,
  value: unknown,
): Promise<string | null> => {
  if (actionType === BannerActionTypes.none) {
    return null;
  }

  if (actionType === BannerActionTypes.link) {
    return pickUrl(value, BannerErrors.linkInvalid);
  }

  const target = pickString(value);

  if (!UUID_PATTERN.test(target)) {
    throw new AppError(BannerErrors.targetRequired, HttpStatus.badRequest);
  }

  const exists = actionType === BannerActionTypes.category
    ? await existsTenantCategory(tenant.id, target)
    : await existsTenantProduct(tenant.id, target);

  if (!exists) {
    throw new AppError(BannerErrors.targetNotFound, HttpStatus.badRequest);
  }

  return target;
};

const readField = (
  payload: Record<string, unknown>,
  key: string,
  fallback: unknown,
): unknown => (key in payload ? payload[key] : fallback);

const buildInput = async (
  tenant: ITenantContext,
  payload: Record<string, unknown>,
  current: IBannerRow | null,
): Promise<IBannerInput> => {
  const imageUrl = resolveImage(payload.imageUrl, current);
  const actionType = pickActionType(readField(payload, 'actionType', current?.action_type));
  const startsAt = pickDate(readField(payload, 'startsAt', current?.starts_at));
  const endsAt = pickDate(readField(payload, 'endsAt', current?.ends_at));

  if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
    throw new AppError(BannerErrors.datesInvalid, HttpStatus.badRequest);
  }

  return {
    imageUrl,
    title: pickText(readField(payload, 'title', current?.title)),
    subtitle: pickText(readField(payload, 'subtitle', current?.subtitle)),
    actionType,
    actionValue: await resolveActionValue(
      tenant,
      actionType,
      readField(payload, 'actionValue', current?.action_value),
    ),
    position: pickPosition(readField(payload, 'position', current?.position), BannerDefaults.position),
    startsAt,
    endsAt,
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : current?.is_active !== false,
  };
};

const requireBanner = async (tenant: ITenantContext, id: string): Promise<IBannerRow> => {
  const row = await selectBannerById(tenant.id, id);

  if (!row) {
    throw new AppError(ErrorMessages.notFound, HttpStatus.notFound);
  }

  return row;
};

export const listBanners = async (tenant: ITenantContext) => (
  (await selectManagedBanners(tenant.id)).map(mapBanner)
);

export const createBanner = async (tenant: ITenantContext, payload: Record<string, unknown>) => {
  const input = await buildInput(tenant, payload, null);

  await ensureCarouselSection(tenant.id, SectionTypes.bannerCarousel, BannerDefaults.sectionPosition);
  await activateCarouselSection(tenant.id, SectionTypes.bannerCarousel);

  return mapBanner(await insertBanner(tenant.id, input));
};

export const updateBanner = async (
  tenant: ITenantContext,
  id: string,
  payload: Record<string, unknown>,
) => {
  const current = await requireBanner(tenant, id);

  return mapBanner(await updateBannerFields(tenant.id, id, await buildInput(tenant, payload, current)));
};

export const deactivateBanner = async (tenant: ITenantContext, id: string) => {
  await requireBanner(tenant, id);

  return mapBanner(await setBannerActive(tenant.id, id, false));
};
