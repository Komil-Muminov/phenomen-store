import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiRoutes, AppRoutes, ManageListLimit, QueryKeys } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { resolveMediaUrl, toHref } from '@/shared/lib';
import { Icon, If, Screen } from '@/shared/ui';
import { useBannerMutations } from '@/widgets/admin-banners/lib';
import {
  BannersTexts,
  EMPTY_BANNER,
  IAdminBanner,
  IAdminBannerList,
  IBannerFormValues,
  buildMove,
  toBannerForm,
  toBannerPayload,
} from '@/widgets/admin-banners/model';
import { RenderBannerForm } from '@/widgets/admin-banners/ui/renderForm';

interface IPickerItem {
  id: string;
  name: string;
}

interface IProductList {
  items: IPickerItem[];
}

export const AdminBanners = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<IAdminBanner | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<IBannerFormValues>(EMPTY_BANNER);
  const mutations = useBannerMutations();

  const bannersQuery = useGetQuery<IAdminBannerList>(
    [QueryKeys.adminBanners, page],
    ApiRoutes.manageBanners,
    { params: { page, limit: ManageListLimit } },
  );
  const categoriesQuery = useGetQuery<IPickerItem[]>(
    [QueryKeys.categories],
    ApiRoutes.manageCategories,
  );
  const productsQuery = useGetQuery<IProductList>(
    [QueryKeys.adminProducts, 'picker'],
    ApiRoutes.manageProducts,
    { params: { page: 1, limit: 50 } },
  );

  const items = bannersQuery.data?.items ?? [];
  const total = bannersQuery.data?.total ?? 0;

  const handleCreate = useCallback(() => {
    setEditing(null);
    setValues(EMPTY_BANNER);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((banner: IAdminBanner) => {
    setEditing(banner);
    setValues(toBannerForm(banner));
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const payload = toBannerPayload(values, editing?.position);
    const onSuccess = () => setFormOpen(false);

    if (editing) {
      mutations.update.mutate({ ...payload, id: editing.id }, { onSuccess });

      return;
    }

    mutations.create.mutate(payload, { onSuccess });
  }, [values, editing, mutations.update, mutations.create]);

  const handleDelete = useCallback((banner: IAdminBanner) => {
    Alert.alert(BannersTexts.deleteTitle, banner.title ?? '', [
      { text: BannersTexts.cancel, style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => mutations.remove.mutate({ id: banner.id }),
      },
    ]);
  }, [mutations.remove]);

  const handleMove = useCallback((index: number, offset: number) => {
    const move = buildMove(items, index, offset);

    if (move) {
      mutations.reorder.mutate(move);
    }
  }, [items, mutations.reorder]);

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.replace(toHref(AppRoutes.admin))}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-xl font-extrabold tracking-tight text-content">
            {BannersTexts.title}
          </Text>
          <Text className="text-xs text-muted">{`${BannersTexts.subtitle} · ${total}`}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={BannersTexts.create}
          onPress={handleCreate}
          className="h-10 w-10 items-center justify-center rounded-xl bg-primary active:opacity-80"
        >
          <Icon name="plus" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <If
          condition={items.length > 0 || bannersQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">{BannersTexts.empty}</Text>
            </View>
          )}
        >
          {items.map((banner, index) => (
            <View key={banner.id} className="gap-3 rounded-2xl border border-line bg-surface p-3">
              <View className="flex-row gap-3">
                <View className="h-16 w-24 overflow-hidden rounded-xl bg-background">
                  <Image
                    source={{ uri: resolveMediaUrl(banner.imageUrl) }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-bold text-content" numberOfLines={1}>
                    {banner.title ?? 'Без заголовка'}
                  </Text>
                  <If condition={Boolean(banner.subtitle)}>
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {banner.subtitle}
                    </Text>
                  </If>
                  <Text
                    className={`text-xs font-semibold ${banner.isActive ? 'text-success' : 'text-danger'}`}
                  >
                    {banner.isActive ? BannersTexts.visible : BannersTexts.hidden}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Выше"
                  disabled={index === 0 || mutations.reorder.isPending}
                  onPress={() => handleMove(index, -1)}
                  className={`h-9 w-9 items-center justify-center rounded-xl bg-background ${index === 0 ? 'opacity-40' : 'active:opacity-80'}`}
                >
                  <Icon name="chevron-left" size={14} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ниже"
                  disabled={index === items.length - 1 || mutations.reorder.isPending}
                  onPress={() => handleMove(index, 1)}
                  className={`h-9 w-9 items-center justify-center rounded-xl bg-background ${index === items.length - 1 ? 'opacity-40' : 'active:opacity-80'}`}
                >
                  <Icon name="chevron-right" size={14} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleEdit(banner)}
                  className="flex-1 items-center rounded-xl bg-primary py-2.5 active:opacity-80"
                >
                  <Text className="text-xs font-semibold text-onPrimary">Изменить</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Удалить баннер"
                  onPress={() => handleDelete(banner)}
                  className="h-9 w-9 items-center justify-center rounded-xl bg-background active:opacity-80"
                >
                  <Icon name="close" size={14} />
                </Pressable>
              </View>
            </View>
          ))}
        </If>

        <If condition={page * ManageListLimit < total}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage((current) => current + 1)}
            className="items-center rounded-2xl border border-line bg-surface py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary">{BannersTexts.loadMore}</Text>
          </Pressable>
        </If>
      </ScrollView>

      <RenderBannerForm
        open={formOpen}
        editing={Boolean(editing)}
        values={values}
        categories={categoriesQuery.data ?? []}
        products={productsQuery.data?.items ?? []}
        saving={mutations.create.isPending || mutations.update.isPending}
        onChange={setValues}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />
    </Screen>
  );
};
