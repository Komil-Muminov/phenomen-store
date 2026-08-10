import { useCallback } from 'react';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { IProduct } from '@/entities/product/model';
import { ICart } from './model';

export { CartItemRow } from './ui';
export { DeliveryMethods, PaymentMethods, DeliveryLabels, PaymentLabels, countCartItems, DEFAULT_CART_TOTALS } from './model';
export type { ICart, ICartItem, ICartTotals } from './model';

export const useAddToCart = () => {
  const { data: cart } = useGetQuery<ICart>(
    [QueryKeys.cart],
    ApiRoutes.cartGet,
    { staleTime: StaleTimeMs.short },
  );

  const updateCart = useMutationQuery<any, ICart>(
    ApiRoutes.cartUpdate,
    { invalidate: [[QueryKeys.cart]] },
  );

  const addToCart = useCallback((product: IProduct, variantId?: string, quantity: number = 1) => {
    const targetVariant = (variantId ? product?.variants?.find((v) => v.id === variantId) : null) ?? product?.variants?.[0];

    if (!targetVariant) {
      return false;
    }

    const currentItems = cart?.items ?? [];
    const existingIndex = currentItems.findIndex((i) => i.variantId === targetVariant.id);
    const addQty = Math.max(1, quantity);
    let nextItems;

    if (existingIndex >= 0) {
      nextItems = currentItems.map((item, idx) => (
        idx === existingIndex ? { ...item, quantity: item.quantity + addQty } : item
      ));
    } else {
      nextItems = [
        ...currentItems,
        {
          variantId: targetVariant.id,
          productId: product.id,
          name: product.name,
          sku: targetVariant.sku,
          options: targetVariant.options,
          quantity: addQty,
          price: targetVariant.price,
          oldPrice: targetVariant.oldPrice,
          total: targetVariant.price * addQty,
          stock: targetVariant.stock,
          media: product.media[0] ?? null,
        },
      ];
    }

    updateCart.mutate({ items: nextItems });
    return true;
  }, [cart?.items, updateCart]);

  return {
    addToCart,
    isPending: updateCart.isPending,
  };
};
