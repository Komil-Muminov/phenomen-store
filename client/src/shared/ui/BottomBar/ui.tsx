import { Pressable, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { AppRoutes } from '@/shared/config';
import { Icon, TIconName } from '@/shared/ui/Icon';
import { useWishlist } from '@/shared/wishlist';

interface INavItem {
  key: string;
  route: string;
  icon: TIconName;
  label: string;
  badge?: number;
}

interface IProps {
  cartCount?: number;
}

export const BottomBar = ({ cartCount = 0 }: IProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();

  const navItems: INavItem[] = [
    { key: 'home', route: AppRoutes.home, icon: 'sparkles', label: 'Главная' },
    { key: 'catalog', route: AppRoutes.catalog, icon: 'search', label: 'Каталог' },
    { key: 'cart', route: AppRoutes.cart, icon: 'bag', label: 'Корзина', badge: cartCount },
    { key: 'wishlist', route: AppRoutes.wishlist, icon: 'heart', label: 'Избранное', badge: wishlistCount },
    { key: 'profile', route: AppRoutes.profile, icon: 'user', label: 'Профиль' },
  ];

  return (
    <View className="absolute bottom-5 inset-x-5 h-16 rounded-full border border-neutral-700/60 bg-neutral-900/95 shadow-2xl flex-row items-center justify-around px-3 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));

        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as any)}
            className="relative items-center justify-center py-1.5 px-3 rounded-full active:scale-90"
          >
            <View className="relative items-center justify-center">
              <Icon
                name={item.icon}
                size={20}
                color={isActive ? '#ffffff' : '#a3a3a3'}
              />
              {Boolean(item.badge && item.badge > 0) && (
                <View className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] items-center justify-center rounded-full bg-accent px-1">
                  <Text className="text-[9px] font-extrabold text-white">
                    {item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={`text-[10px] font-bold mt-0.5 ${
                isActive ? 'text-white font-extrabold' : 'text-neutral-400'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
