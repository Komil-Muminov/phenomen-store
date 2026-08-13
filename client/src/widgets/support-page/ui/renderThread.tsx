import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { formatMoment } from '@/shared/lib';
import { Button, Icon, If } from '@/shared/ui';
import {
  ConversationStatus,
  IThread,
  SupportTexts,
  TEXT_MAX,
} from '@/widgets/support-page/model';

interface IProps {
  thread: IThread;
  draft: string;
  busy: boolean;
  onDraft: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
}

export const RenderThread = ({ thread, draft, busy, onDraft, onSend, onBack }: IProps) => (
  <View className="flex-1 gap-3">
    <Pressable
      accessibilityRole="button"
      onPress={onBack}
      className="flex-row items-center gap-2 self-start rounded-full border border-line/60 bg-surface px-3 py-1.5 active:opacity-80"
    >
      <Icon name="arrow-left" size={16} color="#0284c7" />
      <Text className="text-xs font-bold text-primary">{SupportTexts.back}</Text>
    </Pressable>

    <Text className="text-lg font-extrabold text-content">{thread.conversation.subject}</Text>

    <ScrollView className="flex-1" contentContainerClassName="gap-3 pb-4">
      {thread.messages.map((item) => (
        <View
          key={item.id}
          className={item.author === 'shop' ? 'items-start' : 'items-end'}
        >
          <View
            className={[
              'max-w-[85%] rounded-2xl px-3.5 py-2.5',
              item.author === 'shop' ? 'bg-surface' : 'bg-primary',
            ].join(' ')}
          >
            <Text
              className={`text-sm ${item.author === 'shop' ? 'text-content' : 'text-onPrimary'}`}
            >
              {item.text}
            </Text>
            <Text
              className={`mt-1 text-[11px] ${item.author === 'shop' ? 'text-muted' : 'text-onPrimary/70'}`}
            >
              {`${item.author === 'shop' ? SupportTexts.shopAuthor : SupportTexts.youAuthor} · ${formatMoment(item.createdAt)}`}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>

    <If
      condition={thread.conversation.status === ConversationStatus.open}
      fallback={(
        <View className="rounded-2xl border border-line bg-surface p-3.5">
          <Text className="text-xs font-semibold text-muted">{SupportTexts.closed}</Text>
        </View>
      )}
    >
      <View className="gap-2">
        <TextInput
          value={draft}
          onChangeText={onDraft}
          placeholder={SupportTexts.replyPlaceholder}
          placeholderTextColor="#a3a3a3"
          multiline
          maxLength={TEXT_MAX}
          editable={!busy}
          className="min-h-20 rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content"
        />
        <Button
          title={SupportTexts.reply}
          loading={busy}
          disabled={!draft.trim() || busy}
          onPress={onSend}
        />
      </View>
    </If>
  </View>
);
