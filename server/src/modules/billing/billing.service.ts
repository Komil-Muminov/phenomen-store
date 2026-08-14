import { HttpStatus } from '@/shared/config';
import { AppError, pickString } from '@/shared/utils';
import { invalidateTenantCache } from '@/modules/tenant';
import {
  applyBlock,
  markReminded,
  releaseBlock,
  selectBillingSettings,
  selectBlockedTenantIds,
  selectBlockedTenants,
  selectInvoicesToRemind,
  selectOverdueTenantIds,
  selectOwnersForReminder,
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
  ReminderTexts,
} from '@/modules/billing/types';
import { isMailConfigured, sendMail } from '@/modules/mail';
import {
  NotificationKinds,
  NotificationTexts,
  TNotificationKind,
  insertNotification,
} from '@/modules/notifications';

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
    remindDays: stored?.remind_days ?? BillingDefaults.remindDays,
  };
};

export const saveBillingSettings = async (
  payload: Record<string, unknown>,
): Promise<IBillingSettings> => {
  const raw = Number(payload.graceDays);
  const graceDays = Number.isInteger(raw) && raw >= 0 && raw <= BillingLimits.graceDaysMax
    ? raw
    : BillingDefaults.graceDays;
  const rawRemind = Number(payload.remindDays);
  const remindDays = Number.isInteger(rawRemind)
    && rawRemind >= 0
    && rawRemind <= BillingLimits.remindDaysMax
    ? rawRemind
    : BillingDefaults.remindDays;

  await upsertBillingSettings(graceDays, payload.autoBlock !== false, remindDays);

  return getBillingSettings();
};

const dropCache = async (ids: string[]): Promise<void> => {
  const keys = await selectTenantKeys(ids);

  keys.forEach(invalidateTenantCache);
};

const sendDueReminders = async (remindDays: number): Promise<string[]> => {
  const invoices = await selectInvoicesToRemind(remindDays);

  for (const invoice of invoices) {
    const owners = await selectOwnersForReminder(invoice.tenant_id);
    const amount = `${Number(invoice.amount).toLocaleString('ru-RU')} ${invoice.currency}`;

    for (const owner of owners) {
      await insertNotification(invoice.tenant_id, {
        userId: owner.id,
        kind: NotificationKinds.system as TNotificationKind,
        title: ReminderTexts.title,
        text: ReminderTexts.body(
          invoice.number,
          invoice.period,
          invoice.due_date,
          Number(invoice.days_left),
        ),
        actionUrl: NotificationTexts.invoiceActionUrl,
      });

      if (owner.email && isMailConfigured()) {
        await sendMail({
          to: owner.email,
          subject: ReminderTexts.subject(invoice.number),
          text: ReminderTexts.letter(owner.tenant_name, invoice.number, amount, invoice.due_date),
        }).catch(() => undefined);
      }
    }
  }

  const ids = invoices.map((invoice) => invoice.id);

  await markReminded(ids);

  return ids;
};

export const runBillingCheck = async (): Promise<IBillingRunResult> => {
  const settings = await getBillingSettings();
  const blockedNow = await selectBlockedTenantIds();
  const reminded = await sendDueReminders(settings.remindDays);

  if (!settings.autoBlock) {
    await releaseBlock(blockedNow);
    await dropCache(blockedNow);

    return {
      blocked: [],
      unblocked: blockedNow,
      reminded,
      checkedAt: new Date().toISOString(),
    };
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
    reminded,
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
