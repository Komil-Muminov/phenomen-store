import { AppError } from '@/shared/utils';
import { Env, HttpStatus } from '@/shared/config';
import { initDb } from '@/shared/db/initDb';
import { resolveTenantByKey } from '@/modules/tenant';
import { seedDemoCatalog } from '@/modules/catalog';
import { applyVerticalPreset } from '@/modules/attributes';
import { ensureDemoOwner, ensurePlatformAdmin } from '@/modules/platform';
import { startBillingScheduler } from '@/modules/billing';
import { reportMailStatus } from '@/modules/mail';
import { app } from '@/app';

const DEMO_VERTICAL = 'fashion';

const LISTEN_HOST = '0.0.0.0';

const seedDemoContent = async (): Promise<void> => {
  try {
    const demoTenant = await resolveTenantByKey(Env.defaultTenantKey);

    await applyVerticalPreset(demoTenant.id, DEMO_VERTICAL);
    await seedDemoCatalog(demoTenant.id);
    await ensureDemoOwner(demoTenant);

    console.log(`[bootstrap] тестовый магазин: ${demoTenant.key} (${demoTenant.name})`);
  } catch (error) {
    const isMissingTenant = error instanceof AppError && error.status === HttpStatus.notFound;

    if (!isMissingTenant) {
      throw error;
    }

    console.warn(
      `[bootstrap] демо-магазин "${Env.defaultTenantKey}" не найден или отключён — демо-данные пропущены`,
    );
  }
};

const bootstrap = async (): Promise<void> => {
  await initDb();
  await ensurePlatformAdmin();
  await seedDemoContent();
  await reportMailStatus();
  startBillingScheduler();

  app.listen(Env.port, LISTEN_HOST, () => {
    console.log(`[server] http://localhost:${Env.port} (${Env.nodeEnv}), слушает ${LISTEN_HOST}`);
  });
};

bootstrap().catch((error) => {
  console.error('[bootstrap-error]', error);
  process.exit(1);
});
