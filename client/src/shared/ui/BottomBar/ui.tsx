import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { AppRoutes } from '@/shared/config';
import { triggerHapticLight } from '@/shared/lib';
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

  const handleNavPress = useCallback((route: string) => {
    triggerHapticLight();
    router.push(route as any);
  }, [router]);

  return (
    <View className="absolute bottom-4 inset-x-3 h-16 rounded-full border border-slate-700/60 bg-slate-900/95 shadow-2xl flex-row items-center justify-between px-2 z-50 backdrop-blur-xl">
      {navItems.map((item) => {
        const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));

        return (
          <Pressable
            key={item.key}
            onPress={() => handleNavPress(item.route)}
            className="flex-1 items-center justify-center py-1.5 px-0.5 rounded-full active:scale-90"
          >
            <View className={`items-center justify-center px-3 py-1 rounded-full ${isActive ? 'bg-white/15' : ''}`}>
              <View className="relative items-center justify-center">
                <Icon
                  name={item.icon}
                  size={18}
                  color={isActive ? '#ffffff' : '#94a3b8'}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <View className="absolute -top-1.5 -right-3 min-w-[16px] h-[16px] items-center justify-center rounded-full bg-rose-500 px-1 border border-slate-900 shadow-sm">
                    <Text className="text-[8px] font-black text-white">
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                className={`text-[9px] font-bold mt-0.5 tracking-tight ${
                  isActive ? 'text-white font-black' : 'text-slate-400'
                }`}
              >
                {item.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
