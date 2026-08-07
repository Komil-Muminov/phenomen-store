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

  const addToCart = useCallback((product: IProduct) => {
    const defaultVariant = product?.variants?.[0];

    if (!defaultVariant) {
      return false;
    }

    const currentItems = cart?.items ?? [];
    const existingIndex = currentItems.findIndex((i) => i.variantId === defaultVariant.id);
    let nextItems;

    if (existingIndex >= 0) {
      nextItems = currentItems.map((item, idx) => (
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      nextItems = [
        ...currentItems,
        {
          variantId: defaultVariant.id,
          productId: product.id,
          name: product.name,
          sku: defaultVariant.sku,
          options: defaultVariant.options,
          quantity: 1,
          price: defaultVariant.price,
          oldPrice: defaultVariant.oldPrice,
          total: defaultVariant.price,
          stock: defaultVariant.stock,
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
