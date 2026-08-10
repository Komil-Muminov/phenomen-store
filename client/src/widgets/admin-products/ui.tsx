import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ApiRoutes,
  AppRoutes,
  ManageListLimit,
  QueryKeys,
  SearchDebounceMs,
} from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { Icon, If, Screen } from '@/shared/ui';
import { useProductMutations } from '@/widgets/admin-products/lib';
import {
  EMPTY_FORM,
  IAdminCategory,
  IAdminProduct,
  IAdminProductList,
  IProductFormValues,
  ProductsTexts,
  toFormValues,
  toPayload,
} from '@/widgets/admin-products/model';
import { RenderForm } from '@/widgets/admin-products/ui/renderForm';

export const AdminProducts = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<IAdminProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<IProductFormValues>(EMPTY_FORM);
  const mutations = useProductMutations();

  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied(search);
      setPage(1);
    }, SearchDebounceMs);

    return () => clearTimeout(timer);
  }, [search]);

  const productsQuery = useGetQuery<IAdminProductList>(
    [QueryKeys.adminProducts, applied, page],
    ApiRoutes.manageProducts,
    { params: { page, limit: ManageListLimit, ...(applied ? { search: applied } : {}) } },
  );
  const categoriesQuery = useGetQuery<IAdminCategory[]>(
    [QueryKeys.categories],
    ApiRoutes.manageCategories,
  );

  const handleCreate = useCallback(() => {
    setEditing(null);
    setValues(EMPTY_FORM);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((product: IAdminProduct) => {
    setEditing(product);
    setValues(toFormValues(product));
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const payload = toPayload(values);
    const onSuccess = () => setFormOpen(false);

    if (editing) {
      mutations.update.mutate({ ...payload, id: editing.id }, { onSuccess });

      return;
    }

    mutations.create.mutate(payload, { onSuccess });
  }, [values, editing, mutations.update, mutations.create]);

  const handleCreateCategory = useCallback((name: string) => {
    mutations.createCategory.mutate({ name }, {
      onSuccess: (category) => setValues((current) => ({ ...current, categoryId: category.id })),
    });
  }, [mutations.createCategory]);

  const items = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;

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
            {ProductsTexts.title}
          </Text>
          <Text className="text-xs text-muted">{`Найдено: ${total}`}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ProductsTexts.create}
          onPress={handleCreate}
          className="h-10 w-10 items-center justify-center rounded-xl bg-primary active:opacity-80"
        >
          <Icon name="plus" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <View className="px-4 pb-3">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={ProductsTexts.searchPlaceholder}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content"
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <If
          condition={items.length > 0 || productsQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">
                {applied ? ProductsTexts.emptyFiltered : ProductsTexts.empty}
              </Text>
            </View>
          )}
        >
          {items.map((product) => (
            <Pressable
              key={product.id}
              accessibilityRole="button"
              onPress={() => handleEdit(product)}
              className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3 active:opacity-80"
            >
              <View className="h-16 w-16 overflow-hidden rounded-xl bg-background">
                <If
                  condition={product.media.length > 0}
                  fallback={(
                    <View className="h-full w-full items-center justify-center">
                      <Icon name="bag" size={18} />
                    </View>
                  )}
                >
                  <Image
                    source={{ uri: product.media[0] }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </If>
              </View>

              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-bold text-content" numberOfLines={1}>
                  {product.name}
                </Text>
                <Text className="text-xs text-muted">{product.brand ?? '—'}</Text>
                <Text className="text-sm font-semibold text-content">
                  {`${new Intl.NumberFormat('ru-RU').format(product.price)} смн`}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={ProductsTexts.hide}
                onPress={() => mutations.hide.mutate({ id: product.id })}
                className="h-9 w-9 items-center justify-center rounded-xl bg-background active:opacity-80"
              >
                <Icon name="close" size={14} />
              </Pressable>
            </Pressable>
          ))}
        </If>

        <If condition={page * ManageListLimit < total}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage((current) => current + 1)}
            className="items-center rounded-2xl border border-line bg-surface py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary">{ProductsTexts.loadMore}</Text>
          </Pressable>
        </If>
      </ScrollView>

      <RenderForm
        open={formOpen}
        editing={Boolean(editing)}
        values={values}
        categories={categoriesQuery.data ?? []}
        saving={mutations.create.isPending || mutations.update.isPending}
        onChange={setValues}
        onCreateCategory={handleCreateCategory}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />
    </Screen>
  );
};
