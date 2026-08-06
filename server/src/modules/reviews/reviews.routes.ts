import { Router } from 'express';
import { addProductReview, getProductReviews } from '@/modules/reviews/reviews.service';
import { authMiddleware } from '@/modules/auth';

export const reviewsRouter = Router();

reviewsRouter.get('/get', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId;
    const productId = req.query.productId as string;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId required' });
    }

    const summary = await getProductReviews(tenantId, productId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post('/add', authMiddleware, async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;
    const { productId, rating, text } = req.body;

    if (!userId || !productId || !rating) {
      return res.status(400).json({ success: false, error: 'productId, rating required' });
    }

    const review = await addProductReview(tenantId, userId, productId, Number(rating), text ?? '');
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});
