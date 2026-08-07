import express from 'express';
import cors from 'cors';
import { ApiRoutes, Env } from '@/shared/config';
import { initDb } from '@/shared/db/initDb';
import { errorMiddleware, notFoundMiddleware } from '@/shared/middlewares';
import { resolveTenantByKey, tenantMiddleware, tenantRouter } from '@/modules/tenant';
import { categoryRouter, productRouter, seedDemoCatalog } from '@/modules/catalog';
import { applyVerticalPreset, attributeRouter } from '@/modules/attributes';
import { storefrontRouter } from '@/modules/storefront';
import { cartRouter } from '@/modules/cart';
import { orderRouter } from '@/modules/order';
import { authRouter } from '@/modules/auth';
import { wishlistRouter } from '@/modules/wishlist';
import { reviewsRouter } from '@/modules/reviews';
import { notificationsRouter } from '@/modules/notifications';
import { ensurePlatformAdmin, platformRouter } from '@/modules/platform';

const app = express();

app.use(cors({ origin: Env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get(ApiRoutes.health, (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: Env.nodeEnv } });
});

app.use(ApiRoutes.platform, platformRouter);

app.use(tenantMiddleware);
app.use(ApiRoutes.tenants, tenantRouter);
app.use(ApiRoutes.storefront, storefrontRouter);
app.use(ApiRoutes.catalog, productRouter);
app.use(ApiRoutes.categories, categoryRouter);
app.use(ApiRoutes.attributes, attributeRouter);
app.use(ApiRoutes.cart, cartRouter);
app.use(ApiRoutes.orders, orderRouter);
app.use(ApiRoutes.auth, authRouter);
app.use(ApiRoutes.wishlist, wishlistRouter);
app.use(ApiRoutes.reviews, reviewsRouter);
app.use(ApiRoutes.notifications, notificationsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const bootstrap = async (): Promise<void> => {
  await initDb();
  await ensurePlatformAdmin();

  const demoTenant = await resolveTenantByKey(Env.defaultTenantKey);

  await applyVerticalPreset(demoTenant.id, 'fashion');
  await seedDemoCatalog(demoTenant.id);

  app.listen(Env.port, () => {
    console.log(`[server] http://localhost:${Env.port} (${Env.nodeEnv})`);
  });
};

bootstrap().catch((error) => {
  console.error('[bootstrap-error]', error);
  process.exit(1);
});
