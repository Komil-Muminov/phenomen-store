import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError } from '@/shared/utils';
import { getPublicConfig } from '@/modules/tenant';
import { buildRules, calculateTotals, DeliveryMethods, IPricingItem, IPromotion } from '@/modules/pricing';
import {
  clearCartItems,
  ensureCart,
  selectCartItems,
  selectPromotionByCode,
  setCartPromoCode,
  upsertCartItem,
} from '@/modules/cart/cart.db';
import { CartErrors, ICartItemRow, ICartOwner, MAX_ITEM_QUANTITY } from '@/modules/cart/types';

const mapPricingItem = (row: ICartItemRow): IPricingItem => ({
  variantId: row.variant_id,
  productName: row.product_name,
  sku: row.sku,
  options: row.options,
  quantity: Number(row.quantity),
  price: Number(row.price),
  taxRate: Number(row.tax_rate),
  stock: Math.max(row.stock - row.reserved, 0),
  media: row.media,
});

const mapViewItem = (row: ICartItemRow) => ({
  id: row.id,
  variantId: row.variant_id,
  productId: row.product_id,
  name: row.product_name,
  sku: row.sku,
  options: row.options,
  quantity: Number(row.quantity),
  price: Number(row.price),
  oldPrice: row.old_price === null ? null : Number(row.old_price),
  total: Number(row.price) * Number(row.quantity),
  stock: Math.max(row.stock - row.reserved, 0),
  media: row.media,
});

export const requireOwner = (userId: string | null, guestKey: string | null): ICartOwner => {
  if (!userId && !guestKey) {
    throw new AppError(CartErrors.ownerRequired, HttpStatus.badRequest);
  }

  return { userId, guestKey };
};

const resolvePromotion = async (
  tenant: ITenantContext,
  code: string | null,
): Promise<IPromotion | null> => {
  if (!code) {
    return null;
  }

  const row = await selectPromotionByCode(tenant.id, code);

  return row
    ? {
      id: row.id,
      code: row.code,
      kind: row.kind,
      conditions: row.conditions,
      actions: row.actions,
      priority: row.priority,
    }
    : null;
};

export const getCartState = async (
  tenant: ITenantContext,
  owner: ICartOwner,
  deliveryMethod: string,
) => {
  const cart = await ensureCart(tenant.id, owner);
  const [rows, config] = await Promise.all([
    selectCartItems(tenant.id, cart.id),
    getPublicConfig(tenant),
  ]);
  const promotion = await resolvePromotion(tenant, cart.promo_code);
  const rules = buildRules(config);
  const totals = calculateTotals(rows.map(mapPricingItem), rules, deliveryMethod, promotion);

  return {
    id: cart.id,
    promoCode: cart.promo_code,
    promoApplied: Boolean(promotion),
    deliveryMethod,
    minOrderTotal: rules.minOrderTotal,
    items: rows.map(mapViewItem),
    totals,
  };
};

export const getCartPricing = async (tenant: ITenantContext, owner: ICartOwner) => {
  const cart = await ensureCart(tenant.id, owner);
  const rows = await selectCartItems(tenant.id, cart.id);
  const promotion = await resolvePromotion(tenant, cart.promo_code);

  return { cartId: cart.id, items: rows.map(mapPricingItem), promotion };
};

export const updateCartItem = async (
  tenant: ITenantContext,
  owner: ICartOwner,
  variantId: string,
  quantity: number,
  deliveryMethod: string,
) => {
  if (!Number.isFinite(quantity) || quantity < 0 || quantity > MAX_ITEM_QUANTITY) {
    throw new AppError(CartErrors.invalidQuantity, HttpStatus.badRequest);
  }

  const cart = await ensureCart(tenant.id, owner);

  await upsertCartItem(tenant.id, cart.id, variantId, quantity);

  const state = await getCartState(tenant, owner, deliveryMethod);
  const stored = state.items.find((item) => item.variantId === variantId);

  if (quantity > 0 && !stored) {
    throw new AppError(CartErrors.variantNotFound, HttpStatus.notFound);
  }

  return state;
};

export const clearCart = async (tenant: ITenantContext, owner: ICartOwner, deliveryMethod: string) => {
  const cart = await ensureCart(tenant.id, owner);

  await clearCartItems(tenant.id, cart.id);

  return getCartState(tenant, owner, deliveryMethod);
};

export const applyPromoCode = async (
  tenant: ITenantContext,
  owner: ICartOwner,
  code: string | null,
  deliveryMethod: string,
) => {
  const cart = await ensureCart(tenant.id, owner);
  const promotion = await resolvePromotion(tenant, code);

  if (code && !promotion) {
    throw new AppError(CartErrors.promoNotFound, HttpStatus.notFound);
  }

  await setCartPromoCode(tenant.id, cart.id, code);

  return getCartState(tenant, owner, deliveryMethod);
};

export const mergeGuestCart = async (
  tenant: ITenantContext,
  userId: string,
  guestKey: string | null,
): Promise<void> => {
  if (!guestKey) {
    return;
  }

  const guestCart = await ensureCart(tenant.id, { userId: null, guestKey });
  const guestItems = await selectCartItems(tenant.id, guestCart.id);

  if (guestItems.length === 0) {
    return;
  }

  const userCart = await ensureCart(tenant.id, { userId, guestKey: null });

  for (const item of guestItems) {
    await upsertCartItem(tenant.id, userCart.id, item.variant_id, Number(item.quantity));
  }

  if (guestCart.promo_code && !userCart.promo_code) {
    await setCartPromoCode(tenant.id, userCart.id, guestCart.promo_code);
  }

  await clearCartItems(tenant.id, guestCart.id);
};

export const parseDeliveryMethod = (value: unknown): string => (
  value === DeliveryMethods.pickup ? DeliveryMethods.pickup : DeliveryMethods.courier
);
