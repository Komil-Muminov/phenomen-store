import { Pressable, ScrollView, Text, View } from 'react-native';
import { If } from '@/shared/ui';
import { FacetLabels, SortOptions, TFacets, TSelectedFacets } from '@/features/catalog-filters/model';

interface IProps {
  facets: TFacets;
  selectedFacets: TSelectedFacets;
  sort: string;
  onSortChange: (value: string) => void;
  onFacetToggle: (code: string, value: string) => void;
}

const chipClassName = (active: boolean): string => [
  'rounded-brandSm border px-3 py-2 active:bg-surface',
  active ? 'border-primary bg-primary' : 'border-line bg-background',
].join(' ');

const chipTextClassName = (active: boolean): string => (
  active ? 'text-xs text-onPrimary' : 'text-xs text-content'
);

export const CatalogFilters = ({ facets, selectedFacets, sort, onSortChange, onFacetToggle }: IProps) => (
  <View className="gap-3 pb-2">
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4">
      {SortOptions.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onSortChange(option.value)}
          className={chipClassName(sort === option.value)}
        >
          <Text className={chipTextClassName(sort === option.value)}>{option.label}</Text>
        </Pressable>
      ))}
    </ScrollView>

    {Object.entries(facets).map(([code, values]) => (
      <If key={code} condition={values.length > 0}>
        <View className="gap-2">
          <Text className="px-4 text-xs uppercase text-muted">{FacetLabels[code] ?? code}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4">
            {values.map((item) => {
              const active = (selectedFacets[code] ?? []).includes(item.value);

              return (
                <Pressable
                  key={item.value}
                  onPress={() => onFacetToggle(code, item.value)}
                  className={chipClassName(active)}
                >
                  <Text className={chipTextClassName(active)}>{`${item.value} (${item.total})`}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </If>
    ))}
  </View>
);
