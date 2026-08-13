import express from 'express';
import cors from 'cors';
import { ApiRoutes, Env } from '@/shared/config';
import { errorMiddleware, notFoundMiddleware } from '@/shared/middlewares';
import { tenantMiddleware, tenantRouter } from '@/modules/tenant';
import { categoryRouter, productRouter } from '@/modules/catalog';
import { attributeRouter } from '@/modules/attributes';
import { ensureUploadsRoot, mediaRouter, UPLOADS_ROUTE } from '@/modules/media';
import { storefrontRouter } from '@/modules/storefront';
import { statsRouter } from '@/modules/stats';
import { promotionRouter } from '@/modules/promotion';
import { supportRouter } from '@/modules/support';
import { bannerRouter } from '@/modules/banner';
import { cartRouter } from '@/modules/cart';
import { orderRouter } from '@/modules/order';
import { authRouter } from '@/modules/auth';
import { wishlistRouter } from '@/modules/wishlist';
import { reviewsRouter } from '@/modules/reviews';
import { notificationsRouter } from '@/modules/notifications';
import { platformRouter } from '@/modules/platform';
import { platformTicketRouter, ticketRouter } from '@/modules/tickets';
import { planRouter } from '@/modules/plans';

export const app = express();

app.use(cors({ origin: Env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.use(UPLOADS_ROUTE, express.static(ensureUploadsRoot(), { maxAge: '7d' }));

app.get(ApiRoutes.health, (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: Env.nodeEnv } });
});

app.use(ApiRoutes.platformTickets, platformTicketRouter);
app.use(ApiRoutes.platform, platformRouter);

app.use(tenantMiddleware);
app.use(ApiRoutes.tenants, tenantRouter);
app.use(ApiRoutes.storefront, storefrontRouter);
app.use(ApiRoutes.catalog, productRouter);
app.use(ApiRoutes.categories, categoryRouter);
app.use(ApiRoutes.banners, bannerRouter);
app.use(ApiRoutes.attributes, attributeRouter);
app.use(ApiRoutes.media, mediaRouter);
app.use(ApiRoutes.cart, cartRouter);
app.use(ApiRoutes.orders, orderRouter);
app.use(ApiRoutes.stats, statsRouter);
app.use(ApiRoutes.promotions, promotionRouter);
app.use(ApiRoutes.support, supportRouter);
app.use(ApiRoutes.tickets, ticketRouter);
app.use(ApiRoutes.plans, planRouter);
app.use(ApiRoutes.auth, authRouter);
app.use(ApiRoutes.wishlist, wishlistRouter);
app.use(ApiRoutes.reviews, reviewsRouter);
app.use(ApiRoutes.notifications, notificationsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
