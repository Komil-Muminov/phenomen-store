import { Text, View } from 'react-native';
import { ICategory } from '@/entities/category';
import { IProduct } from '@/entities/product';
import { If } from '@/shared/ui';
import {
  IBanner,
  ISectionHandlers,
  IStorefrontSection,
  SectionEmptyMessage,
  SectionTypes,
} from '@/features/storefront-sections/model';
import { BannerCarousel, CategoryGrid, ProductRail, PromoBlock } from '@/features/storefront-sections/ui/sections';

interface IProps extends ISectionHandlers {
  sections: IStorefrontSection[];
}

const renderSection = (section: IStorefrontSection, handlers: ISectionHandlers) => {
  if (section.type === SectionTypes.bannerCarousel) {
    return <BannerCarousel banners={section.items as IBanner[]} onPress={handlers.onBannerPress} />;
  }

  if (section.type === SectionTypes.categoryGrid) {
    return <CategoryGrid categories={section.items as ICategory[]} onPress={handlers.onCategoryPress} />;
  }

  if (section.type === SectionTypes.productRail) {
    return (
      <ProductRail
        products={section.items as IProduct[]}
        currencySymbol={handlers.currencySymbol}
        onPress={handlers.onProductPress}
      />
    );
  }

  if (section.type === SectionTypes.promoBlock) {
    return (
      <PromoBlock
        products={section.items as IProduct[]}
        currencySymbol={handlers.currencySymbol}
        onPress={handlers.onProductPress}
      />
    );
  }

  return <Text className="px-4 text-sm text-muted">{SectionEmptyMessage}</Text>;
};

export const StorefrontSections = ({ sections, ...handlers }: IProps) => (
  <View className="gap-6 pb-6">
    {sections.map((section) => (
      <View key={section.id} className="gap-3">
        <If condition={Boolean(section.title)}>
          <Text className="px-4 text-xl font-semibold text-content">{section.title}</Text>
        </If>
        {renderSection(section, handlers)}
      </View>
    ))}
  </View>
);
