import { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, Icon, If, ImageField } from '@/shared/ui';
import {
  CategoryTexts,
  EMPTY_DRAFT,
  ICategoryDraft,
  ICategoryHandlers,
  IEditorCategory,
  toCategoryDraft,
  toCategoryPayload,
} from '@/features/category-editor/model';

interface IProps extends ICategoryHandlers {
  categories: IEditorCategory[];
  value: string | null;
  isBusy: boolean;
  onChange: (value: string | null) => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5';

export const CategoryEditor = ({
  categories,
  value,
  isBusy,
  onChange,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: IProps) => {
  const [draft, setDraft] = useState<ICategoryDraft | null>(null);

  const patch = useCallback((next: Partial<ICategoryDraft>) => {
    setDraft((current) => (current ? { ...current, ...next } : current));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!draft?.name.trim()) {
      return;
    }

    const payload = toCategoryPayload(draft);

    if (draft.id) {
      onUpdateCategory(draft.id, payload);
    } else {
      onCreateCategory(payload);
    }

    setDraft(null);
  }, [draft, onCreateCategory, onUpdateCategory]);

  const handleDelete = useCallback((category: IEditorCategory) => {
    Alert.alert(CategoryTexts.deleteTitle, `«${category.name}». ${CategoryTexts.deleteHint}`, [
      { text: CategoryTexts.cancel, style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          onDeleteCategory(category.id);

          if (value === category.id) {
            onChange(null);
          }
        },
      },
    ]);
  }, [onDeleteCategory, onChange, value]);

  return (
    <View className="gap-2">
      <Text className={LABEL}>{CategoryTexts.label}</Text>

      <View className="flex-row flex-wrap gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(null)}
          className={`${CHIP} ${value ? 'border-line bg-surface' : 'border-primary bg-primary'}`}
        >
          <Text className={`text-xs font-semibold ${value ? 'text-muted' : 'text-onPrimary'}`}>
            {CategoryTexts.none}
          </Text>
        </Pressable>

        {categories.map((category) => (
          <View
            key={category.id}
            className={`${CHIP} ${value === category.id ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
          >
            <Pressable accessibilityRole="button" onPress={() => onChange(category.id)}>
              <Text
                className={`text-xs font-semibold ${value === category.id ? 'text-onPrimary' : 'text-muted'}`}
              >
                {category.isActive === false ? `${category.name} · ${CategoryTexts.hidden}` : category.name}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Изменить категорию ${category.name}`}
              onPress={() => setDraft(toCategoryDraft(category))}
              className="px-0.5"
            >
              <Icon name="filter" size={11} color={value === category.id ? '#ffffff' : '#94a3b8'} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Удалить категорию ${category.name}`}
              onPress={() => handleDelete(category)}
              className="px-0.5"
            >
              <Icon name="close" size={11} color={value === category.id ? '#ffffff' : '#94a3b8'} />
            </Pressable>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={() => setDraft(EMPTY_DRAFT)}
          className={`${CHIP} border-dashed border-line`}
        >
          <Icon name="plus" size={12} />
          <Text className="text-xs font-semibold text-primary">{CategoryTexts.create}</Text>
        </Pressable>
      </View>

      <Modal visible={Boolean(draft)} animationType="slide" onRequestClose={() => setDraft(null)}>
        <View className="flex-1 bg-background">
          <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={CategoryTexts.cancel}
              onPress={() => setDraft(null)}
              className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
            >
              <Icon name="close" size={18} />
            </Pressable>

            <Text className="flex-1 text-lg font-extrabold text-content">
              {draft?.id ? CategoryTexts.editTitle : CategoryTexts.createTitle}
            </Text>
          </View>

          <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
            <View className="gap-1.5">
              <Text className={LABEL}>{CategoryTexts.nameLabel}</Text>
              <TextInput
                autoFocus
                value={draft?.name ?? ''}
                onChangeText={(name) => patch({ name })}
                placeholder={CategoryTexts.namePlaceholder}
                className={FIELD}
              />
            </View>

            <View className="gap-1.5">
              <Text className={LABEL}>{CategoryTexts.parentLabel}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => patch({ parentId: null })}
                  className={`rounded-full border px-3 py-1.5 ${draft?.parentId ? 'border-line bg-surface' : 'border-primary bg-primary'}`}
                >
                  <Text
                    className={`text-xs font-semibold ${draft?.parentId ? 'text-muted' : 'text-onPrimary'}`}
                  >
                    {CategoryTexts.parentNone}
                  </Text>
                </Pressable>

                {categories
                  .filter((item) => item.id !== draft?.id)
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      onPress={() => patch({ parentId: item.id })}
                      className={`rounded-full border px-3 py-1.5 ${draft?.parentId === item.id ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${draft?.parentId === item.id ? 'text-onPrimary' : 'text-muted'}`}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>

            <ImageField
              value={draft?.imageUrl ?? ''}
              label={CategoryTexts.imageLabel}
              onChange={(imageUrl) => patch({ imageUrl })}
            />

            <View className="gap-1.5">
              <Text className={LABEL}>{CategoryTexts.positionLabel}</Text>
              <TextInput
                value={draft?.position ?? ''}
                onChangeText={(position) => patch({ position })}
                keyboardType="numeric"
                className={FIELD}
              />
              <Text className="text-xs text-muted">{CategoryTexts.positionHint}</Text>
            </View>

            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: draft?.isActive !== false }}
              onPress={() => patch({ isActive: !(draft?.isActive ?? true) })}
              className="flex-row items-center gap-3"
            >
              <View
                className={`h-6 w-11 justify-center rounded-full px-0.5 ${draft?.isActive !== false ? 'bg-primary' : 'bg-line'}`}
              >
                <View
                  className={`h-5 w-5 rounded-full bg-background ${draft?.isActive !== false ? 'self-end' : 'self-start'}`}
                />
              </View>
              <Text className="flex-1 text-sm font-medium text-content">
                {CategoryTexts.visibleLabel}
              </Text>
            </Pressable>

            <View className="gap-2 pt-2">
              <Button
                title={CategoryTexts.save}
                loading={isBusy}
                disabled={!draft?.name.trim()}
                onPress={handleSubmit}
              />
              <Button
                title={CategoryTexts.cancel}
                variant={ButtonVariants.secondary}
                onPress={() => setDraft(null)}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
