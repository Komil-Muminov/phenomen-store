import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Icon, If } from '@/shared/ui';
import {
  FacetLabels,
  SortOptions,
  TFacets,
  TSelectedFacets,
  countActiveFilters,
} from '@/features/catalog-filters/model';

interface IProps {
  facets: TFacets;
  selectedFacets: TSelectedFacets;
  sort: string;
  minPrice: string;
  maxPrice: string;
  totalProducts?: number;
  onSortChange: (value: string) => void;
  onFacetToggle: (code: string, value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onResetAll: () => void;
}

export const CatalogFilters = ({
  facets,
  selectedFacets,
  sort,
  minPrice,
  maxPrice,
  totalProducts = 0,
  onSortChange,
  onFacetToggle,
  onPriceChange,
  onResetAll,
}: IProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);

  const activeCount = countActiveFilters(selectedFacets, minPrice, maxPrice, sort);

  const openModal = useCallback(() => {
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setModalVisible(true);
  }, [minPrice, maxPrice]);

  const handleApply = useCallback(() => {
    onPriceChange(draftMinPrice, draftMaxPrice);
    setModalVisible(false);
  }, [draftMinPrice, draftMaxPrice, onPriceChange]);

  const handleReset = useCallback(() => {
    setDraftMinPrice('');
    setDraftMaxPrice('');
    onResetAll();
  }, [onResetAll]);

  return (
    <View className="pb-3 gap-2">
      {/* WB-style компактная верхняя панель фильтрации */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 items-center"
      >
        {/* Кнопка "Все фильтры" со счетчиком (как в WB) */}
        <Pressable
          onPress={openModal}
          className={`flex-row items-center gap-2 rounded-2xl border px-3.5 py-2 active:opacity-80 ${
            activeCount > 0
              ? 'border-primary/80 bg-primary/10'
              : 'border-line bg-surface/70'
          }`}
        >
          <Icon name="sliders" size={15} color={activeCount > 0 ? '#4f46e5' : '#171717'} />
          <Text className={`text-xs font-bold ${activeCount > 0 ? 'text-primary' : 'text-content'}`}>
            Фильтры
          </Text>
          <If condition={activeCount > 0}>
            <View className="min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-primary">
              <Text className="text-[11px] font-extrabold text-white leading-none">{activeCount}</Text>
            </View>
          </If>
        </Pressable>

        {/* Чипы быстрой сортировки */}
        {SortOptions.map((option) => {
          const isActive = sort === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSortChange(option.value)}
              className={`rounded-xl border px-3 py-2 active:bg-surface ${
                isActive
                  ? 'border-primary bg-primary'
                  : 'border-line bg-surface/50'
              }`}
            >
              <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Модальная шторка всех фильтров (Wildberries style) */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setModalVisible(false)}>
          <Pressable
            className="h-[88%] rounded-t-3xl bg-background border-t border-line flex-col justify-between"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Шапка модального окна фильтров */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-line">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-extrabold text-content">Фильтры</Text>
                <If condition={activeCount > 0}>
                  <View className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-primary">{activeCount} выбрано</Text>
                  </View>
                </If>
              </View>

              <View className="flex-row items-center gap-3">
                <If condition={activeCount > 0}>
                  <Pressable onPress={handleReset} className="px-2 py-1">
                    <Text className="text-xs font-bold text-rose-600">Сбросить всё</Text>
                  </Pressable>
                </If>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-surface border border-line"
                >
                  <Icon name="close" size={14} color="#737373" />
                </Pressable>
              </View>
            </View>

            {/* Тело фильтров со скроллом */}
            <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
              <View className="gap-6 pb-8">
                {/* 1. Блок сортировки */}
                <View className="gap-3">
                  <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                    Сортировка
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {SortOptions.map((option) => {
                      const isActive = sort === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => onSortChange(option.value)}
                          className={`rounded-xl px-3.5 py-2.5 border items-center justify-center ${
                            isActive
                              ? 'border-primary bg-primary'
                              : 'border-line bg-surface/60'
                          }`}
                        >
                          <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-content'}`}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Блок диапазона цен (Цена от / до) */}
                <View className="gap-3">
                  <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                    Цена, смн
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 flex-row items-center rounded-xl border border-line bg-surface/60 px-3.5 py-2">
                      <Text className="text-xs font-bold text-muted mr-2">от</Text>
                      <TextInput
                        value={draftMinPrice}
                        onChangeText={setDraftMinPrice}
                        placeholder="0"
                        placeholderTextColor="#a3a3a3"
                        keyboardType="numeric"
                        className="flex-1 text-sm font-bold text-content p-0"
                      />
                    </View>
                    <View className="h-0.5 w-3 bg-line" />
                    <View className="flex-1 flex-row items-center rounded-xl border border-line bg-surface/60 px-3.5 py-2">
                      <Text className="text-xs font-bold text-muted mr-2">до</Text>
                      <TextInput
                        value={draftMaxPrice}
                        onChangeText={setDraftMaxPrice}
                        placeholder="100 000"
                        placeholderTextColor="#a3a3a3"
                        keyboardType="numeric"
                        className="flex-1 text-sm font-bold text-content p-0"
                      />
                    </View>
                  </View>
                </View>

                {/* 3. Динамические фасеты (Размер, Цвет и т.д.) */}
                {Object.entries(facets).map(([code, values]) => (
                  <If key={code} condition={values.length > 0}>
                    <View className="gap-3">
                      <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                        {FacetLabels[code] ?? code}
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {values.map((item) => {
                          const active = (selectedFacets[code] ?? []).includes(item.value);
                          return (
                            <Pressable
                              key={item.value}
                              onPress={() => onFacetToggle(code, item.value)}
                              className={`rounded-xl px-3.5 py-2 border items-center justify-center ${
                                active
                                  ? 'border-primary bg-primary'
                                  : 'border-line bg-surface/60'
                              }`}
                            >
                              <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-content'}`}>
                                {`${item.value} (${item.total})`}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </If>
                ))}
              </View>
            </ScrollView>

            {/* Фиксированная кнопка примянения внизу (как в WB) */}
            <View className="p-4 border-t border-line bg-background">
              <Button
                title={totalProducts > 0 ? `Показать ${totalProducts} товаров` : 'Показать товары'}
                onPress={handleApply}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
