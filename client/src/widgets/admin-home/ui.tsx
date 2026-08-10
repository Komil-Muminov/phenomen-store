import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppRoutes, StaffScopes } from '@/shared/config';
import { useStaffAuth } from '@/shared/staff-auth';
import { Button, ButtonVariants, Icon, If, Screen } from '@/shared/ui';
import { AdminTexts } from '@/widgets/admin-home/model';
import { pickSections } from '@/widgets/admin-home/lib';

export const AdminHome = () => {
  const router = useRouter();
  const { session, ready, signOut } = useStaffAuth();

  const handleLogout = useCallback(() => {
    signOut().then(() => router.replace(AppRoutes.profile));
  }, [signOut, router]);

  const isPlatform = session?.scope === StaffScopes.platform;
  const sections = pickSections(session?.scope ?? StaffScopes.shop);

  return (
    <Screen padded={false}>
      <If
        condition={ready && Boolean(session)}
        fallback={(
          <View className="flex-1 gap-4 px-4 pt-4">
            <View className="h-24 rounded-2xl border border-line/40 bg-surface/60" />
            <View className="h-24 rounded-2xl border border-line/40 bg-surface/60" />
          </View>
        )}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10 pt-4 gap-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <Text className="text-2xl font-extrabold tracking-tight text-content">
              {isPlatform ? AdminTexts.platformTitle : AdminTexts.shopTitle}
            </Text>
            <Text className="text-sm text-muted">
              {isPlatform
                ? AdminTexts.platformSubtitle
                : session?.tenantName ?? session?.tenantKey ?? ''}
            </Text>
            <Text className="text-xs font-medium text-muted">{session?.name}</Text>
          </View>

          <View className="gap-3">
            {sections.map((section) => (
              <Pressable
                key={section.key}
                accessibilityRole="button"
                onPress={() => router.push(section.route)}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-4 active:opacity-80"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-background">
                  <Icon name={section.icon} size={20} />
                </View>

                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-semibold text-content">{section.title}</Text>
                  <Text className="text-xs text-muted">{section.subtitle}</Text>
                </View>

                <Icon name="chevron-right" size={18} />
              </Pressable>
            ))}
          </View>

          <Button
            title={AdminTexts.logout}
            variant={ButtonVariants.secondary}
            onPress={handleLogout}
          />
        </ScrollView>
      </If>
    </Screen>
  );
};
