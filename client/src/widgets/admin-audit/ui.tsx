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
import { useGetQuery } from '@/shared/hooks';
import { Icon, If, Screen } from '@/shared/ui';
import {
  AuditActionLabels,
  AuditTexts,
  IAuditList,
  formatMoment,
} from '@/widgets/admin-audit/model';

export const AdminAudit = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied(search);
      setPage(1);
    }, SearchDebounceMs);

    return () => clearTimeout(timer);
  }, [search]);

  const auditQuery = useGetQuery<IAuditList>(
    [QueryKeys.adminAudit, applied, page],
    ApiRoutes.platformAudit,
    { params: { page, limit: ManageListLimit, ...(applied ? { search: applied } : {}) } },
  );

  const handleMore = useCallback(() => setPage((current) => current + 1), []);

  const items = auditQuery.data?.items ?? [];
  const total = auditQuery.data?.total ?? 0;

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
            {AuditTexts.title}
          </Text>
          <Text className="text-xs text-muted">{`Найдено: ${total}`}</Text>
        </View>
      </View>

      <View className="px-4 pb-3">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={AuditTexts.searchPlaceholder}
          autoCapitalize="none"
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content"
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <If
          condition={items.length > 0 || auditQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">
                {applied ? AuditTexts.emptyFiltered : AuditTexts.empty}
              </Text>
            </View>
          )}
        >
          {items.map((entry) => (
            <View key={entry.id} className="gap-1 rounded-2xl border border-line bg-surface p-4">
              <Text className="text-sm font-bold text-content">
                {AuditActionLabels[entry.action] ?? entry.action}
              </Text>

              <Text className="text-xs text-muted">
                {[entry.actorLogin, entry.tenantKey].filter(Boolean).join(' · ')}
              </Text>

              <Text className="text-xs text-muted">{formatMoment(entry.createdAt)}</Text>
            </View>
          ))}
        </If>

        <If condition={page * ManageListLimit < total}>
          <Pressable
            accessibilityRole="button"
            onPress={handleMore}
            className="items-center rounded-2xl border border-line bg-surface py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary">{AuditTexts.loadMore}</Text>
          </Pressable>
        </If>
      </ScrollView>
    </Screen>
  );
};
