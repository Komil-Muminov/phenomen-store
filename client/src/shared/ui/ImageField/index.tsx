import { Image, Pressable, Text, View } from 'react-native';
import { useImageUpload } from '@/shared/hooks';
import { Icon } from '@/shared/ui/Icon';
import { If } from '@/shared/ui/If';
import { resolveMediaUrl } from '@/shared/lib';

interface IProps {
  value: string;
  label: string;
  onChange: (url: string) => void;
  previewClass?: string;
  stacked?: boolean;
}

const DEFAULT_PREVIEW = 'h-20 w-20';

export const ImageField = ({
  value,
  label,
  onChange,
  previewClass = DEFAULT_PREVIEW,
  stacked = false,
}: IProps) => {
  const { uploading, error, pick } = useImageUpload(onChange);

  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</Text>

      <View className={stacked ? 'gap-3' : 'flex-row items-center gap-3'}>
        <View
          className={`items-center justify-center overflow-hidden rounded-xl border border-line bg-background ${previewClass}`}
        >
          <If condition={Boolean(value)} fallback={<Icon name="bag" size={18} />}>
            <Image source={{ uri: resolveMediaUrl(value) }} className="h-full w-full" resizeMode="cover" />
          </If>
        </View>

        <View className={stacked ? 'gap-2' : 'flex-1 gap-2'}>
          <Pressable
            accessibilityRole="button"
            disabled={uploading}
            onPress={pick}
            className="items-center rounded-xl border border-line bg-surface py-2.5 active:opacity-80"
          >
            <Text className="text-xs font-semibold text-primary">
              {uploading ? 'Загрузка…' : (value ? 'Заменить' : 'Выбрать файл')}
            </Text>
          </Pressable>

          <If condition={Boolean(value)}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onChange('')}
              className="items-center py-1"
            >
              <Text className="text-xs font-semibold text-danger">Убрать</Text>
            </Pressable>
          </If>
        </View>
      </View>

      <If condition={Boolean(error)}>
        <Text className="text-xs text-danger">{error}</Text>
      </If>
    </View>
  );
};
