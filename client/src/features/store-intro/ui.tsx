import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ITenantConfig } from '@/entities/tenant';
import { AppRoutes } from '@/shared/config';
import { Icon, If } from '@/shared/ui';

interface IProps {
  config: ITenantConfig;
  cartCount: number;
  onCartPress: () => void;
  onProfilePress: () => void;
  onSearchPress: () => void;
}

export const StoreIntro = ({
  config,
  cartCount,
  onCartPress,
  onProfilePress,
  onSearchPress,
}: IProps) => {
  const router = useRouter();

  return (
    <View className="gap-3 px-4 pb-3 pt-2">
      <View className="flex-row items-center gap-2.5">
        <If condition={Boolean(config.brand.logoUrl)}>
          <Image
            source={{ uri: config.brand.logoUrl ?? '' }}
            className="h-10 w-10 rounded-xl"
            resizeMode="contain"
          />
        </If>
        <View className="flex-1 shrink">
          <Text numberOfLines={1} className="text-xl font-extrabold tracking-tight text-content">
            {config.brand.title}
          </Text>
          <If condition={Boolean(config.brand.slogan)}>
            <Text numberOfLines={1} className="text-xs text-muted">
              {config.brand.slogan}
            </Text>
          </If>
        </View>

        <Pressable
          onPress={() => router.push(AppRoutes.notifications)}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="sparkles" size={18} color="#e11d48" />
        </Pressable>

        <Pressable
          onPress={onProfilePress}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="user" size={18} />
        </Pressable>

        <Pressable
          onPress={onCartPress}
          className="relative h-10 flex-row items-center gap-1.5 rounded-xl border border-line bg-background px-3 active:border-primary active:bg-surface"
        >
          <Icon name="bag" size={18} />
          <If condition={cartCount > 0}>
            <View className="min-w-[18px] h-[18px] items-center justify-center rounded-full bg-accent px-1">
              <Text className="text-[10px] font-bold text-onPrimary">{cartCount}</Text>
            </View>
          </If>
        </Pressable>
      </View>

      <Pressable
        onPress={onSearchPress}
        className="h-11 flex-row items-center gap-2.5 rounded-xl border border-line bg-surface px-4 active:border-primary"
      >
        <Icon name="search" size={18} color="#737373" />
        <Text className="flex-1 text-sm text-muted">Поиск по каталогу...</Text>
      </Pressable>
    </View>
  );
};
