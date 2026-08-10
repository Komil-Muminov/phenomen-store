import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ApiRoutes,
  AppRoutes,
  ManageListLimit,
  QueryKeys,
  SearchDebounceMs,
} from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Icon, If, Screen } from '@/shared/ui';
import { IStockItem, IStockList, StockTexts } from '@/widgets/admin-stock/model';
import { RenderStockRow } from '@/widgets/admin-stock/ui/renderRow';

export const AdminStock = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied(search);
      setPage(1);
    }, SearchDebounceMs);

    return () => clearTimeout(timer);
  }, [search]);

  const stockQuery = useGetQuery<IStockList>(
    [QueryKeys.adminStock, applied, onlyEmpty, page],
    ApiRoutes.manageStock,
    {
      params: {
        page,
        limit: ManageListLimit,
        ...(applied ? { search: applied } : {}),
        ...(onlyEmpty ? { onlyEmpty: true } : {}),
      },
    },
  );

  const stockMutation = useMutationQuery<{ id: string; stock: number }, IStockItem>(
    (body) => `${ApiRoutes.manageStockUpdate}/${body.id}`,
    { method: 'patch', invalidate: [[QueryKeys.adminStock], [QueryKeys.adminProducts]] },
  );

  const handleDraftChange = useCallback((id: string, value: string) => {
    setDrafts((current) => ({ ...current, [id]: value }));
  }, []);

  const handleCommit = useCallback((item: IStockItem, value: number) => {
    setDrafts((current) => ({ ...current, [item.id]: String(value) }));

    if (value === item.stock) {
      return;
    }

    setSavingId(item.id);

    stockMutation.mutate({ id: item.id, stock: value }, {
      onSettled: () => setSavingId(null),
    });
  }, [stockMutation]);

  const handleFilter = useCallback((next: boolean) => {
    setOnlyEmpty(next);
    setPage(1);
  }, []);

  const items = stockQuery.data?.items ?? [];
  const total = stockQuery.data?.total ?? 0;

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.replace(AppRoutes.admin)}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-xl font-extrabold tracking-tight text-content">
            {StockTexts.title}
          </Text>
          <Text className="text-xs text-muted">{`Найдено: ${total}`}</Text>
        </View>
      </View>

      <View className="gap-2 px-4 pb-3">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={StockTexts.searchPlaceholder}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content"
        />

        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => handleFilter(false)}
            className={`rounded-full border px-3 py-1.5 ${onlyEmpty ? 'border-line bg-surface' : 'border-primary bg-primary'}`}
          >
            <Text className={`text-xs font-semibold ${onlyEmpty ? 'text-muted' : 'text-onPrimary'}`}>
              {StockTexts.all}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => handleFilter(true)}
            className={`rounded-full border px-3 py-1.5 ${onlyEmpty ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
          >
            <Text className={`text-xs font-semibold ${onlyEmpty ? 'text-onPrimary' : 'text-muted'}`}>
              {StockTexts.onlyEmpty}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-10"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <If
          condition={items.length > 0 || stockQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">
                {applied || onlyEmpty ? StockTexts.emptyFiltered : StockTexts.empty}
              </Text>
            </View>
          )}
        >
          {items.map((item) => (
            <RenderStockRow
              key={item.id}
              item={item}
              draft={drafts[item.id]}
              saving={savingId === item.id}
              onDraftChange={handleDraftChange}
              onCommit={handleCommit}
            />
          ))}
        </If>

        <If condition={page * ManageListLimit < total}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage((current) => current + 1)}
            className="items-center rounded-2xl border border-line bg-surface py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary">{StockTexts.loadMore}</Text>
          </Pressable>
        </If>
      </ScrollView>
    </Screen>
  );
};
