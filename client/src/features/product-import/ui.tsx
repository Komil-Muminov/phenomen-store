import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import {
  IImportResult,
  IImportRow,
  ImportTexts,
  buildTemplate,
  parseCsv,
} from '@/features/product-import/model';

interface IProps {
  open: boolean;
  saving: boolean;
  result: IImportResult | null;
  onSubmit: (rows: IImportRow[]) => void;
  onClose: () => void;
}

const PREVIEW_LIMIT = 5;

export const ProductImport = ({ open, saving, result, onSubmit, onClose }: IProps) => {
  const [text, setText] = useState('');

  const parsed = useMemo(() => parseCsv(text), [text]);

  const handleTemplate = useCallback(() => setText(buildTemplate()), []);

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ImportTexts.cancel}
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
          >
            <Icon name="close" size={18} />
          </Pressable>

          <Text className="flex-1 text-lg font-extrabold text-content">{ImportTexts.title}</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-4 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm leading-5 text-muted">{ImportTexts.hint}</Text>

          <Button
            title={ImportTexts.template}
            variant={ButtonVariants.secondary}
            onPress={handleTemplate}
          />

          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={ImportTexts.placeholder}
            textAlignVertical="top"
            className="h-48 rounded-2xl border border-line bg-surface px-4 py-3 font-mono text-sm text-content"
          />

          <If condition={parsed.unknown.length > 0}>
            <Text className="text-xs text-danger">
              {`${ImportTexts.unknownColumns}: ${parsed.unknown.join(', ')}`}
            </Text>
          </If>

          <If condition={text.trim().length > 0}>
            <View className="gap-2 rounded-2xl border border-line bg-surface/60 p-4">
              <Text className="text-sm font-bold text-content">
                {`${ImportTexts.parsed}: ${parsed.rows.length}`}
              </Text>

              {parsed.rows.slice(0, PREVIEW_LIMIT).map((row, index) => (
                <Text key={`${row.name}-${index}`} className="text-xs text-muted">
                  {`${row.name} — ${row.price}${row.category ? ` · ${row.category}` : ''}`}
                </Text>
              ))}

              <If condition={parsed.rows.length > PREVIEW_LIMIT}>
                <Text className="text-xs text-muted">
                  {`…и ещё ${parsed.rows.length - PREVIEW_LIMIT}`}
                </Text>
              </If>
            </View>
          </If>

          <If condition={Boolean(result)}>
            <View className="gap-1 rounded-2xl border border-line bg-surface/60 p-4">
              <Text className="text-sm font-bold text-success">
                {`${ImportTexts.created}: ${result?.created ?? 0} · ${ImportTexts.updated}: ${result?.updated ?? 0}`}
              </Text>

              <If condition={(result?.failed.length ?? 0) > 0}>
                <Text className="text-sm font-semibold text-danger">
                  {`${ImportTexts.failed}: ${result?.failed.length}`}
                </Text>
              </If>

              {(result?.failed ?? []).slice(0, PREVIEW_LIMIT).map((item) => (
                <Text key={`${item.row}-${item.name}`} className="text-xs text-muted">
                  {`Строка ${item.row}: ${item.name} — ${item.reason}`}
                </Text>
              ))}
            </View>
          </If>

          <Button
            title={`${ImportTexts.submit}${parsed.rows.length ? ` ${parsed.rows.length}` : ''}`}
            loading={saving}
            disabled={parsed.rows.length === 0}
            onPress={() => onSubmit(parsed.rows)}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};
