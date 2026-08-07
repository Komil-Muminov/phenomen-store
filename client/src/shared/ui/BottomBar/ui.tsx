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
    <View className="absolute bottom-4 inset-x-2.5 h-16 rounded-full border border-neutral-700/60 bg-neutral-900/95 shadow-2xl flex-row items-center justify-between px-1.5 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));

        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as any)}
            className="flex-1 items-center justify-center py-1 px-0.5 rounded-full active:scale-95"
          >
            <View className="relative items-center justify-center">
              <Icon
                name={item.icon}
                size={19}
                color={isActive ? '#ffffff' : '#a3a3a3'}
              />
              {Boolean(item.badge && item.badge > 0) && (
                <View className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] items-center justify-center rounded-full bg-accent px-1">
                  <Text className="text-[8px] font-extrabold text-white">
                    {item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              className={`text-[9.5px] font-bold mt-0.5 tracking-tighter ${isActive ? 'text-white font-extrabold' : 'text-neutral-400'
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
