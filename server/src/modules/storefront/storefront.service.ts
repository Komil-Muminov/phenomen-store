import { ITenantContext } from '@/shared/types';
import { buildSearchParams, getCategories, searchProducts } from '@/modules/catalog';
import { selectBanners, selectSections } from '@/modules/storefront/storefront.db';
import { IBannerRow, IResolvedSection, ISectionRow, SectionDefaults, SectionTypes } from '@/modules/storefront/types';

const mapBanner = (row: IBannerRow) => ({
  id: row.id,
  imageUrl: row.image_url,
  title: row.title,
  subtitle: row.subtitle,
  actionType: row.action_type,
  actionValue: row.action_value,
});

const readNumberParam = (params: Record<string, unknown>, key: string, fallback: number): number => {
  const parsed = Number(params[key]);

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const resolveProductRail = async (
  tenant: ITenantContext,
  section: ISectionRow,
): Promise<unknown[]> => {
  const limit = readNumberParam(section.params, 'limit', SectionDefaults.railLimit);
  const sort = typeof section.params.sort === 'string' ? section.params.sort : undefined;
  const categoryId = typeof section.params.categoryId === 'string' ? section.params.categoryId : undefined;
  const params = buildSearchParams({ sort, categoryId }, 1, limit);
  const result = await searchProducts(tenant, params, 1);

  return result.items;
};

const resolveSection = async (
  tenant: ITenantContext,
  section: ISectionRow,
  banners: IBannerRow[],
  categories: Awaited<ReturnType<typeof getCategories>>,
): Promise<IResolvedSection> => {
  const base = {
    id: section.id,
    type: section.type,
    title: section.title,
    params: section.params,
  };

  if (section.type === SectionTypes.bannerCarousel) {
    return { ...base, items: banners.map(mapBanner) };
  }

  if (section.type === SectionTypes.categoryGrid) {
    const limit = readNumberParam(section.params, 'limit', SectionDefaults.categoryLimit);

    return { ...base, items: categories.slice(0, limit) };
  }

  if (section.type === SectionTypes.productRail || section.type === SectionTypes.promoBlock) {
    return { ...base, items: await resolveProductRail(tenant, section) };
  }

  return { ...base, items: [] };
};

export const getLayout = async (tenant: ITenantContext): Promise<IResolvedSection[]> => {
  const [sections, banners, categories] = await Promise.all([
    selectSections(tenant.id),
    selectBanners(tenant.id),
    getCategories(tenant),
  ]);

  return Promise.all(sections.map((section) => resolveSection(tenant, section, banners, categories)));
};
