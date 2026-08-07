import { Pressable, Text, View } from 'react-native';
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
    return (
      <BannerCarousel
        banners={section.items as IBanner[]}
        brandTitle={handlers.brandTitle}
        onPress={handlers.onBannerPress}
      />
    );
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
  <View className="gap-6 pb-2">
    {sections.map((section) => (
      <View key={section.id} className="gap-3.5">
        <If condition={Boolean(section.title)}>
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-xl font-extrabold tracking-tight text-content">
              {section.title}
            </Text>
            <Pressable onPress={() => handlers.onCategoryPress?.({ id: '', name: section.title } as any)}>
              <Text className="text-xs font-extrabold text-primary">Смотреть все ›</Text>
            </Pressable>
          </View>
        </If>
        {renderSection(section, handlers)}
      </View>
    ))}
  </View>
);
