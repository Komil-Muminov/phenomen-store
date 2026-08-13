import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiRoutes, AppRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { formatMoment, toHref } from '@/shared/lib';
import { Icon, If, Screen } from '@/shared/ui';
import {
  ConversationStatus,
  IConversationList,
  IThread,
  SupportTexts,
} from '@/widgets/support-page/model';
import { RenderNew } from '@/widgets/support-page/ui/renderNew';
import { RenderThread } from '@/widgets/support-page/ui/renderThread';

export const SupportPage = () => {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [draft, setDraft] = useState('');

  const listQuery = useGetQuery<IConversationList>(
    [QueryKeys.support],
    ApiRoutes.supportSearch,
    { params: { limit: 50 } },
  );

  const threadQuery = useGetQuery<IThread>(
    [QueryKeys.support, 'thread', activeId],
    `${ApiRoutes.supportGet}/${activeId}`,
    { enabled: Boolean(activeId) },
  );

  const createMutation = useMutationQuery<{ subject: string; text: string }, IThread>(
    ApiRoutes.supportCreate,
    { invalidate: [[QueryKeys.support]] },
  );

  const replyMutation = useMutationQuery<{ id: string; text: string }, IThread>(
    (body) => `${ApiRoutes.supportReply}/${body.id}`,
    { invalidate: [[QueryKeys.support]] },
  );

  const handleCreate = useCallback(() => {
    createMutation.mutate({ subject: subject.trim(), text: text.trim() }, {
      onSuccess: (thread) => {
        setFormOpen(false);
        setSubject('');
        setText('');
        setActiveId(thread.conversation.id);
      },
    });
  }, [createMutation, subject, text]);

  const handleReply = useCallback(() => {
    if (!activeId) {
      return;
    }

    replyMutation.mutate({ id: activeId, text: draft.trim() }, {
      onSuccess: () => {
        setDraft('');
        threadQuery.refetch();
      },
    });
  }, [activeId, draft, replyMutation, threadQuery]);

  const items = listQuery.data?.items ?? [];

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SupportTexts.back}
          onPress={() => router.replace(toHref(AppRoutes.profile))}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-xl font-extrabold tracking-tight text-content">
            {SupportTexts.title}
          </Text>
          <Text className="text-xs text-muted">{SupportTexts.subtitle}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SupportTexts.create}
          onPress={() => setFormOpen(true)}
          className="h-10 w-10 items-center justify-center rounded-xl bg-primary active:opacity-80"
        >
          <Icon name="plus" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <View className="flex-1 px-4 pb-6">
        <If
          condition={Boolean(activeId && threadQuery.data)}
          fallback={(
            <ScrollView className="flex-1" contentContainerClassName="gap-3 pb-6">
              <If
                condition={items.length > 0}
                fallback={(
                  <View className="items-center gap-1 rounded-2xl border border-line bg-surface px-4 py-10">
                    <Text className="text-sm font-medium text-muted">{SupportTexts.empty}</Text>
                    <Text className="text-center text-xs text-muted">{SupportTexts.emptyHint}</Text>
                  </View>
                )}
              >
                {items.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => setActiveId(item.id)}
                    className="gap-1 rounded-2xl border border-line bg-surface p-4 active:opacity-80"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="flex-1 text-sm font-bold text-content" numberOfLines={1}>
                        {item.subject}
                      </Text>
                      <If condition={item.unreadForCustomer > 0}>
                        <View className="h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5">
                          <Text className="text-[11px] font-bold text-onPrimary">
                            {item.unreadForCustomer}
                          </Text>
                        </View>
                      </If>
                    </View>
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {item.lastText ?? ''}
                    </Text>
                    <Text className="text-[11px] text-muted">
                      {`${formatMoment(item.lastMessageAt)} · ${item.status === ConversationStatus.open ? 'открыто' : 'закрыто'}`}
                    </Text>
                  </Pressable>
                ))}
              </If>
            </ScrollView>
          )}
        >
          <RenderThread
            thread={threadQuery.data as IThread}
            draft={draft}
            busy={replyMutation.isPending}
            onDraft={setDraft}
            onSend={handleReply}
            onBack={() => setActiveId(null)}
          />
        </If>
      </View>

      <RenderNew
        open={formOpen}
        subject={subject}
        text={text}
        busy={createMutation.isPending}
        onSubject={setSubject}
        onText={setText}
        onSubmit={handleCreate}
        onClose={() => setFormOpen(false)}
      />
    </Screen>
  );
};
