import { HttpStatus } from '@/shared/config';
import { AppError, pickString } from '@/shared/utils';
import { invalidateTenantCache } from '@/modules/tenant';
import {
  applyBlock,
  releaseBlock,
  selectBillingSettings,
  selectBlockedTenantIds,
  selectBlockedTenants,
  selectOverdueTenantIds,
  selectTenantKeys,
  upsertBillingSettings,
} from '@/modules/billing/billing.db';
import {
  BillingDefaults,
  BillingLimits,
  BlockReasons,
  IBillingRunResult,
  IBillingSettings,
  IBlockedTenantRow,
} from '@/modules/billing/types';

const mapBlocked = (row: IBlockedTenantRow) => ({
  id: row.id,
  key: row.key,
  name: row.name,
  blockedAt: row.blocked_at,
  reason: row.block_reason,
  overdueCount: Number(row.overdue_count ?? 0),
  overdueAmount: Number(row.overdue_amount ?? 0),
});

export const getBillingSettings = async (): Promise<IBillingSettings> => {
  const stored = await selectBillingSettings();

  return {
    graceDays: stored?.grace_days ?? BillingDefaults.graceDays,
    autoBlock: stored?.auto_block ?? BillingDefaults.autoBlock,
  };
};

export const saveBillingSettings = async (
  payload: Record<string, unknown>,
): Promise<IBillingSettings> => {
  const raw = Number(payload.graceDays);
  const graceDays = Number.isInteger(raw) && raw >= 0 && raw <= BillingLimits.graceDaysMax
    ? raw
    : BillingDefaults.graceDays;

  await upsertBillingSettings(graceDays, payload.autoBlock !== false);

  return getBillingSettings();
};

const dropCache = async (ids: string[]): Promise<void> => {
  const keys = await selectTenantKeys(ids);

  keys.forEach(invalidateTenantCache);
};

export const runBillingCheck = async (): Promise<IBillingRunResult> => {
  const settings = await getBillingSettings();
  const blockedNow = await selectBlockedTenantIds();

  if (!settings.autoBlock) {
    await releaseBlock(blockedNow);
    await dropCache(blockedNow);

    return { blocked: [], unblocked: blockedNow, checkedAt: new Date().toISOString() };
  }

  const overdue = await selectOverdueTenantIds(settings.graceDays);
  const toBlock = overdue.filter((id) => !blockedNow.includes(id));
  const toRelease = blockedNow.filter((id) => !overdue.includes(id));

  await applyBlock(toBlock, BlockReasons.overdue);
  await releaseBlock(toRelease);
  await dropCache([...toBlock, ...toRelease]);

  return {
    blocked: toBlock,
    unblocked: toRelease,
    checkedAt: new Date().toISOString(),
  };
};

export const listBlockedTenants = async () => ({
  items: (await selectBlockedTenants()).map(mapBlocked),
});

export const releaseTenantBlock = async (payload: Record<string, unknown>) => {
  const id = pickString(payload.tenantId);

  if (!id) {
    throw new AppError('Не указан магазин', HttpStatus.badRequest);
  }

  await releaseBlock([id]);
  await dropCache([id]);

  return listBlockedTenants();
};

export const startBillingScheduler = (): NodeJS.Timeout => {
  const period = BillingDefaults.intervalMinutes * 60 * 1000;

  void runBillingCheck().catch(() => undefined);

  return setInterval(() => {
    void runBillingCheck().catch(() => undefined);
  }, period).unref();
};
