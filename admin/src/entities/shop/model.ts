import type {
  IAttribute,
  IBanner,
  ICategory,
  IOrder,
  IOrderDetail,
  IOrderHistoryEntry,
  IOrderItem,
  IOrderPayment,
  IProduct,
  IProductVariant,
  IStockItem,
  TAttributeList,
  TBannerList,
  TCategoryList,
  TOrderList,
  TProductList,
  TStockList,
} from '@contracts';

export type {
  IOrder,
  IOrderDetail,
  IOrderHistoryEntry,
  IOrderItem,
  IOrderPayment,
  IProductVariant,
  IStockItem,
};

export type IShopProduct = IProduct;

export type IShopCategory = ICategory;

export type IShopAttribute = IAttribute;

export type IShopBanner = IBanner;

export type IOrderList = TOrderList;

export type IShopProductList = TProductList;

export type IStockList = TStockList;

export type IShopCategoryList = TCategoryList;

export type IShopAttributeList = TAttributeList;

export type IShopBannerList = TBannerList;

export interface IShopSession {
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

