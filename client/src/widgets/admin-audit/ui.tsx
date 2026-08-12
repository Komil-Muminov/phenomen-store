import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ApiRoutes,
  AppRoutes,
  ManageListLimit,
  QueryKeys,
  SearchDebounceMs,
} from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { toHref } from '@/shared/lib';
import { Icon, If, Screen } from '@/shared/ui';
import {
  AuditActionLabels,
  AuditCategoryFilters,
  AuditTexts,
  IAuditList,
  formatMoment,
  getActionStyle,
} from '@/widgets/admin-audit/model';

const getPageNumbers = (current: number, total: number): (number | string)[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
};

export const AdminAudit = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, SearchDebounceMs);

    return () => clearTimeout(timer);
  }, [search]);

  const activeCategoryObj = AuditCategoryFilters.find((c) => c.id === selectedCategory);
  const actionPrefix = activeCategoryObj?.actionPrefix;

  const queryParams = {
    page,
    limit: ManageListLimit,
    ...(appliedSearch ? { search: appliedSearch } : {}),
    ...(actionPrefix ? { action: actionPrefix } : {}),
  };

  const auditQuery = useGetQuery<IAuditList>(
    [QueryKeys.adminAudit, appliedSearch, selectedCategory, page],
    ApiRoutes.platformAudit,
    { params: queryParams },
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  };

  const items = auditQuery.data?.items ?? [];
  const total = auditQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / ManageListLimit);
  const pageNumbers = getPageNumbers(page, totalPages);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    setExpandedId(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRefresh = useCallback(() => {
    auditQuery.refetch();
  }, [auditQuery]);

  const hasActiveFilters = Boolean(appliedSearch) || selectedCategory !== 'all';
  const isInitialLoading = auditQuery.isLoading;

  return (
    <Screen padded={false}>
      {/* Top Navigation Header */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Назад"
            onPress={() => router.replace(toHref(AppRoutes.admin))}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface active:opacity-80"
          >
            <Icon name="chevron-left" size={20} color="#171717" />
          </Pressable>

          <View>
            <Text className="text-xl font-extrabold tracking-tight text-content">
              {AuditTexts.title}
            </Text>
            <Text className="text-xs font-medium text-muted">
              {`Найдено: ${total}${totalPages > 1 ? ` · Стр. ${page} из ${totalPages}` : ''}`}
            </Text>
          </View>
        </View>

        {hasActiveFilters && (
          <Pressable
            onPress={() => {
              handleClearSearch();
              handleCategorySelect('all');
            }}
            className="rounded-xl bg-line/30 px-3 py-1.5 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-content">Сбросить</Text>
          </Pressable>
        )}
      </View>

      {/* Search Bar Input */}
      <View className="px-4 pb-2 pt-1">
        <View className="flex-row items-center rounded-2xl border border-line bg-surface px-3.5 py-2.5">
          <Icon name="search" size={18} color="#909090" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={AuditTexts.searchPlaceholder}
            autoCapitalize="none"
            placeholderTextColor="#a3a3a3"
            className="flex-1 px-2.5 text-sm text-content"
          />
          {Boolean(search) && (
            <Pressable
              onPress={handleClearSearch}
              className="h-6 w-6 items-center justify-center rounded-full bg-line/40 active:opacity-70"
            >
              <Icon name="cross" size={12} color="#737373" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Horizontal Filter Chips Carousel */}
      <View className="py-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          contentContainerClassName="flex-row items-center gap-2 px-4 py-1"
        >
          {AuditCategoryFilters.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <Pressable
                key={cat.id}
                onPress={() => handleCategorySelect(cat.id)}
                className={`h-9 px-3.5 flex-row items-center gap-2 rounded-full border active:opacity-80 ${
                  isActive ? 'border-content bg-content' : 'border-line bg-surface'
                }`}
              >
                <Icon name={cat.icon} size={14} color={isActive ? '#ffffff' : '#737373'} />
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-surface' : 'text-content'
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Action Logs List ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="gap-2.5 px-4 pb-10 pt-1"
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={auditQuery.isFetching && !isInitialLoading}
            onRefresh={handleRefresh}
            tintColor="#171717"
          />
        )}
      >
        {/* Initial Loading Skeletons */}
        <If condition={isInitialLoading}>
          <View className="gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 opacity-60">
                <View className="h-9 w-9 rounded-xl bg-line/40" />
                <View className="flex-1 gap-1.5">
                  <View className="h-4 w-32 rounded bg-line/40" />
                  <View className="h-3 w-48 rounded bg-line/30" />
                </View>
              </View>
            ))}
          </View>
        </If>

        {/* Empty State */}
        <If condition={!isInitialLoading && items.length === 0}>
          <View className="items-center justify-center rounded-2xl border border-line bg-surface p-8 my-4 gap-3 text-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-line/30">
              <Icon name="search" size={28} color="#909090" />
            </View>
            <Text className="text-base font-bold text-content">
              {hasActiveFilters ? AuditTexts.emptyFiltered : AuditTexts.empty}
            </Text>
            <Text className="text-xs text-muted text-center px-4">
              {hasActiveFilters
                ? 'Попробуйте изменить поисковый запрос или выбранную категорию'
                : 'Событий пока не зарегистрировано'}
            </Text>
            {hasActiveFilters && (
              <Pressable
                onPress={() => {
                  handleClearSearch();
                  handleCategorySelect('all');
                }}
                className="mt-2 rounded-xl bg-content px-4 py-2.5 active:opacity-80 flex-row items-center gap-2"
              >
                <Icon name="refresh" size={16} color="#ffffff" />
                <Text className="text-xs font-bold text-surface">{AuditTexts.resetFilters}</Text>
              </Pressable>
            )}
          </View>
        </If>

        {/* Action Log Entries */}
        <If condition={!isInitialLoading && items.length > 0}>
          {items.map((entry) => {
            const style = getActionStyle(entry.action);
            const isExpanded = expandedId === entry.id;
            const actionLabel = AuditActionLabels[entry.action] ?? entry.action;
            const payloadEntries = Object.entries(entry.payload || {});

            const metaParts = [
              entry.actorLogin,
              entry.tenantKey,
              entry.ip,
              formatMoment(entry.createdAt),
            ].filter(Boolean);

            return (
              <Pressable
                key={entry.id}
                onPress={() => setExpandedId(isExpanded ? null : entry.id)}
                className="rounded-2xl border border-line bg-surface p-3.5 active:opacity-90 shadow-xs"
              >
                <View className="flex-row items-center justify-between gap-3">
                  {/* Left Action Icon */}
                  <View
                    style={{ backgroundColor: style.iconBg }}
                    className="h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  >
                    <Icon name={style.icon} size={18} color={style.iconColor} />
                  </View>

                  {/* Middle Action Details & Meta Line */}
                  <View className="flex-1 justify-center gap-0.5">
                    <Text className="text-sm font-bold text-content leading-tight">
                      {actionLabel}
                    </Text>
                    <Text className="text-xs text-muted font-medium" numberOfLines={1}>
                      {metaParts.join('  ·  ')}
                    </Text>
                  </View>

                  {/* Right Action Tag Badge & Chevron */}
                  <View className="flex-row items-center gap-2 flex-shrink-0">
                    <View
                      style={{ backgroundColor: style.badgeBg }}
                      className="rounded-lg px-2.5 py-1"
                    >
                      <Text style={{ color: style.badgeText }} className="text-[10px] font-bold">
                        {style.tag}
                      </Text>
                    </View>

                    {payloadEntries.length > 0 && (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-line/20">
                        <Icon
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={12}
                          color="#737373"
                        />
                      </View>
                    )}
                  </View>
                </View>

                {/* Expanded Payload Details Accordion */}
                {isExpanded && payloadEntries.length > 0 && (
                  <View className="mt-3 rounded-xl bg-line/20 p-3 border border-line/80 gap-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Детали события
                    </Text>
                    {payloadEntries.map(([k, v]) => (
                      <View key={k} className="flex-row items-start justify-between gap-2">
                        <Text className="text-xs font-mono text-muted">{k}:</Text>
                        <Text className="text-xs font-mono font-semibold text-content flex-1 text-right">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Numbered Page Pagination Bar (1, 2, 3, 4 ...) */}
          <If condition={totalPages > 1}>
            <View className="mt-4 flex-row items-center justify-between border-t border-line/60 pt-4 pb-6 px-1">
              {/* Previous Page Button */}
              <Pressable
                onPress={() => handlePageChange(page - 1)}
                disabled={page === 1 || auditQuery.isFetching}
                className={`h-9 w-9 items-center justify-center rounded-xl border ${
                  page === 1
                    ? 'border-line/40 bg-surface/50 opacity-30'
                    : 'border-line bg-surface active:opacity-80'
                }`}
              >
                <Icon name="chevron-left" size={16} color="#171717" />
              </Pressable>

              {/* Page Number Buttons */}
              <View className="flex-row items-center gap-1.5">
                {pageNumbers.map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <View key={`ellipsis-${idx}`} className="h-9 w-6 items-center justify-center">
                        <Text className="text-xs font-bold text-muted">...</Text>
                      </View>
                    );
                  }

                  const isCurrent = p === page;

                  return (
                    <Pressable
                      key={p}
                      onPress={() => handlePageChange(p)}
                      disabled={isCurrent || auditQuery.isFetching}
                      className={`h-9 min-w-[36px] px-2.5 items-center justify-center rounded-xl border ${
                        isCurrent
                          ? 'border-content bg-content'
                          : 'border-line bg-surface active:opacity-80'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-surface' : 'text-content'
                        }`}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Next Page Button */}
              <Pressable
                onPress={() => handlePageChange(page + 1)}
                disabled={page === totalPages || auditQuery.isFetching}
                className={`h-9 w-9 items-center justify-center rounded-xl border ${
                  page === totalPages
                    ? 'border-line/40 bg-surface/50 opacity-30'
                    : 'border-line bg-surface active:opacity-80'
                }`}
              >
                <Icon name="chevron-right" size={16} color="#171717" />
              </Pressable>
            </View>
          </If>
        </If>
      </ScrollView>
    </Screen>
  );
};



