export { productRouter, categoryRouter } from '@/modules/catalog/catalog.routes';
export { searchProducts, getCategories, getProduct, buildSearchParams } from '@/modules/catalog/catalog.service';
export { seedDemoCatalog } from '@/modules/catalog/catalog.db';
export type { IProductRow, ICategoryRow, IProductSearchParams } from '@/modules/catalog/types';
