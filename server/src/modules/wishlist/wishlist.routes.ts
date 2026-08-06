import { Router } from 'express';
import { getWishlistProductIds, toggleWishlistItem } from '@/modules/wishlist/wishlist.service';
import { authMiddleware } from '@/modules/auth';

export const wishlistRouter = Router();

wishlistRouter.get('/get', authMiddleware, async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.json({ success: true, data: { ids: [] } });
    }

    const ids = await getWishlistProductIds(tenantId, userId);
    res.json({ success: true, data: { ids } });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.post('/toggle', authMiddleware, async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;
    const { productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, error: 'productId required' });
    }

    const result = await toggleWishlistItem(tenantId, userId, productId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
