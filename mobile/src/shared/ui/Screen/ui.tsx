import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
}

export const Screen = ({ children, scrollable = false, padded = true }: IProps) => (
  <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
    {scrollable ? (
      <ScrollView
        className="flex-1"
        contentContainerClassName={padded ? 'px-4 pb-8 pt-2' : 'pb-8'}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View className={padded ? 'flex-1 px-4 pt-2' : 'flex-1'}>{children}</View>
    )}
  </SafeAreaView>
);
