import express from 'express';
import cors from 'cors';
import { ApiRoutes, Env } from '@/shared/config';
import { initDb } from '@/shared/db/initDb';
import { errorMiddleware, notFoundMiddleware } from '@/shared/middlewares';
import { resolveTenantByKey, tenantMiddleware, tenantRouter } from '@/modules/tenant';
import { categoryRouter, productRouter, seedDemoCatalog } from '@/modules/catalog';
import { storefrontRouter } from '@/modules/storefront';
import { cartRouter } from '@/modules/cart';
import { orderRouter } from '@/modules/order';
import { authRouter } from '@/modules/auth';

const app = express();

app.use(cors({ origin: Env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get(ApiRoutes.health, (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: Env.nodeEnv } });
});

app.use(tenantMiddleware);
app.use(ApiRoutes.tenants, tenantRouter);
app.use(ApiRoutes.storefront, storefrontRouter);
app.use(ApiRoutes.catalog, productRouter);
app.use(ApiRoutes.categories, categoryRouter);
app.use(ApiRoutes.cart, cartRouter);
app.use(ApiRoutes.orders, orderRouter);
app.use(ApiRoutes.auth, authRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const bootstrap = async (): Promise<void> => {
  await initDb();

  const demoTenant = await resolveTenantByKey(Env.defaultTenantKey);

  await seedDemoCatalog(demoTenant.id);

  app.listen(Env.port, () => {
    console.log(`[server] http://localhost:${Env.port} (${Env.nodeEnv})`);
  });
};

bootstrap().catch((error) => {
  console.error('[bootstrap-error]', error);
  process.exit(1);
});
