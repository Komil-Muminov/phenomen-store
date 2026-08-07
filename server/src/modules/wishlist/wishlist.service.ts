import { selectWishlistIds, toggleFavorite } from '@/modules/wishlist/wishlist.db';

export interface IWishlistItem {
  productId: string;
}

export interface IWishlistToggleResult {
  wishlisted: boolean;
  ids: string[];
}

export const getWishlistProductIds = async (
  tenantId: string,
  userId: string,
): Promise<string[]> => selectWishlistIds(tenantId, userId);

export const toggleWishlistItem = async (
  tenantId: string,
  userId: string,
  productId: string,
): Promise<IWishlistToggleResult> => toggleFavorite(tenantId, userId, productId);
