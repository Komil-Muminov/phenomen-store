import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import {
  appendAttributeValue,
  countAttributeUsage,
  deleteAttributeById,
  existsAttributeCode,
  insertAttribute,
  seedAttributePreset,
  selectAttributeById,
  selectAttributes,
  updateAttributeFields,
} from '@/modules/attributes/attributes.db';
import {
  ATTRIBUTE_PRESETS,
  AttributeErrors,
  AttributeValueTypes,
  CODE_PATTERN,
  IAttribute,
  IAttributeRow,
} from '@/modules/attributes/types';

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};

const mapAttribute = (row: IAttributeRow): IAttribute => ({
  id: row.id,
  code: row.code,
  name: row.name,
  valueType: row.value_type,
  isVariantOption: row.is_variant_option,
  isFilterable: row.is_filterable,
  position: row.position,
  values: Array.isArray(row.values) ? row.values : [],
});

export const buildCode = (source: string): string => {
  const base = source
    .toLowerCase()
    .split('')
    .map((char) => TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return CODE_PATTERN.test(base) ? base : `attr_${Date.now()}`;
};

export const listAttributes = async (tenant: ITenantContext): Promise<IAttribute[]> => (
  (await selectAttributes(tenant.id)).map(mapAttribute)
);

export const createAttribute = async (
  tenant: ITenantContext,
  payload: Record<string, unknown>,
): Promise<IAttribute> => {
  const name = pickString(payload.name);

  if (!name) {
    throw new AppError(AttributeErrors.nameRequired, HttpStatus.badRequest);
  }

  const code = pickString(payload.code) || buildCode(name);

  if (await existsAttributeCode(tenant.id, code)) {
    throw new AppError(AttributeErrors.codeTaken, HttpStatus.conflict);
  }

  const values = Array.isArray(payload.values)
    ? payload.values.filter((item): item is string => typeof item === 'string')
    : [];

  return mapAttribute(await insertAttribute(
    tenant.id,
    code,
    name,
    AttributeValueTypes.string,
    payload.isVariantOption === true,
    payload.isFilterable !== false,
    Number.isFinite(Number(payload.position)) ? Number(payload.position) : 100,
    values,
  ));
};

export const updateAttribute = async (
  tenant: ITenantContext,
  id: string,
  payload: Record<string, unknown>,
): Promise<IAttribute> => {
  const existing = await selectAttributeById(tenant.id, id);

  if (!existing) {
    throw new AppError(AttributeErrors.notFound, HttpStatus.notFound);
  }

  const values = Array.isArray(payload.values)
    ? payload.values.filter((item): item is string => typeof item === 'string')
    : null;

  await updateAttributeFields(
    tenant.id,
    id,
    pickString(payload.name) || null,
    Number.isFinite(Number(payload.position)) ? Number(payload.position) : null,
    values,
  );

  return mapAttribute((await selectAttributeById(tenant.id, id)) as IAttributeRow);
};

export const deleteAttribute = async (
  tenant: ITenantContext,
  id: string,
): Promise<{ deleted: boolean }> => {
  const existing = await selectAttributeById(tenant.id, id);

  if (!existing) {
    throw new AppError(AttributeErrors.notFound, HttpStatus.notFound);
  }

  const used = await countAttributeUsage(tenant.id, existing.code, existing.is_variant_option);

  if (used > 0) {
    throw new AppError(
      existing.is_variant_option
        ? `Характеристика используется в ${used} вариантах товаров. Сначала уберите её из товаров`
        : `Характеристика заполнена у ${used} товаров. Сначала очистите её в карточках`,
      HttpStatus.conflict,
    );
  }

  await deleteAttributeById(tenant.id, id);

  return { deleted: true };
};

export const rememberValue = async (
  tenantId: string,
  code: string,
  rawValue: unknown,
): Promise<void> => {
  const value = pickString(rawValue);

  if (value) {
    await appendAttributeValue(tenantId, code, value);
  }
};

export const applyVerticalPreset = async (
  tenantId: string,
  vertical: string,
): Promise<number> => seedAttributePreset(
  tenantId,
  ATTRIBUTE_PRESETS[vertical] ?? ATTRIBUTE_PRESETS.universal,
);
