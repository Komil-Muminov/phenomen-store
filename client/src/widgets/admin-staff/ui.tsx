import { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiRoutes, AppRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Button, ButtonVariants, Icon, If, Screen } from '@/shared/ui';
import {
  EMPTY_STAFF_VALUES,
  IStaffMember,
  IStaffValues,
  StaffRoleLabels,
  StaffTexts,
  buildStaffPayload,
  isStaffValid,
  toStaffValues,
} from '@/widgets/admin-staff/model';

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const AdminStaff = () => {
  const router = useRouter();
  const { tenantId, tenantName } = useLocalSearchParams<{
    tenantId: string;
    tenantName?: string;
  }>();
  const [editing, setEditing] = useState<IStaffMember | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<IStaffValues>(EMPTY_STAFF_VALUES);
  const [error, setError] = useState<string | null>(null);

  const staffQuery = useGetQuery<IStaffMember[]>(
    [QueryKeys.adminStaff, tenantId],
    `${ApiRoutes.tenantsStaffSearch}/${tenantId}`,
    { enabled: Boolean(tenantId) },
  );

  const createMutation = useMutationQuery<Record<string, unknown>, { id: string }>(
    `${ApiRoutes.tenantsStaffCreate}/${tenantId}`,
    { invalidate: [[QueryKeys.adminStaff]] },
  );
  const updateMutation = useMutationQuery<Record<string, unknown> & { staffId: string }, IStaffMember>(
    (body) => `${ApiRoutes.tenantsStaffUpdate}/${tenantId}/${body.staffId}`,
    { method: 'patch', invalidate: [[QueryKeys.adminStaff]] },
  );
  const removeMutation = useMutationQuery<{ staffId: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.tenantsStaffDelete}/${tenantId}/${body.staffId}`,
    { method: 'delete', invalidate: [[QueryKeys.adminStaff]] },
  );

  const handleCreate = useCallback(() => {
    setEditing(null);
    setValues(EMPTY_STAFF_VALUES);
    setError(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((member: IStaffMember) => {
    setEditing(member);
    setValues(toStaffValues(member));
    setError(null);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const payload = buildStaffPayload(values);
    const onSuccess = () => setFormOpen(false);
    const onError = (mutationError: Error) => setError(mutationError.message);

    if (editing) {
      updateMutation.mutate({ ...payload, staffId: editing.id }, { onSuccess, onError });

      return;
    }

    createMutation.mutate(payload, { onSuccess, onError });
  }, [values, editing, updateMutation, createMutation]);

  const handleDelete = useCallback((member: IStaffMember) => {
    Alert.alert(StaffTexts.deleteTitle, `${member.name ?? member.email}. ${StaffTexts.deleteHint}`, [
      { text: StaffTexts.cancel, style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => removeMutation.mutate({ staffId: member.id }),
      },
    ]);
  }, [removeMutation]);

  const items = staffQuery.data ?? [];

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.replace(AppRoutes.adminTenants)}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-xl font-extrabold tracking-tight text-content">
            {StaffTexts.title}
          </Text>
          <Text className="text-xs text-muted">{tenantName ?? ''}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={StaffTexts.add}
          onPress={handleCreate}
          className="h-10 w-10 items-center justify-center rounded-xl bg-primary active:opacity-80"
        >
          <Icon name="plus" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <If
          condition={items.length > 0 || staffQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">{StaffTexts.empty}</Text>
            </View>
          )}
        >
          {items.map((member) => (
            <View key={member.id} className="gap-3 rounded-2xl border border-line bg-surface p-4">
              <View className="gap-0.5">
                <Text className="text-sm font-bold text-content">{member.name ?? '—'}</Text>
                <Text className="text-xs text-muted">
                  {[member.email, member.phone].filter(Boolean).join(' · ')}
                </Text>
                <Text className="text-xs font-semibold text-primary">
                  {StaffRoleLabels[member.role] ?? member.role}
                </Text>
                <If condition={member.status !== 'active'}>
                  <Text className="text-xs font-semibold text-danger">{StaffTexts.disabled}</Text>
                </If>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleEdit(member)}
                  className="flex-1 items-center rounded-xl bg-primary py-2.5 active:opacity-80"
                >
                  <Text className="text-xs font-semibold text-onPrimary">Изменить</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Удалить сотрудника"
                  onPress={() => handleDelete(member)}
                  className="h-10 w-10 items-center justify-center rounded-xl bg-background active:opacity-80"
                >
                  <Icon name="close" size={14} />
                </Pressable>
              </View>
            </View>
          ))}
        </If>
      </ScrollView>

      <Modal visible={formOpen} animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View className="flex-1 bg-background">
          <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={StaffTexts.cancel}
              onPress={() => setFormOpen(false)}
              className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
            >
              <Icon name="close" size={18} />
            </Pressable>

            <Text className="flex-1 text-lg font-extrabold text-content">
              {editing ? StaffTexts.editTitle : StaffTexts.createTitle}
            </Text>
          </View>

          <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
            <View className="gap-1.5">
              <Text className={LABEL}>{StaffTexts.nameLabel}</Text>
              <TextInput
                value={values.name}
                onChangeText={(name) => setValues({ ...values, name })}
                placeholder="Имя владельца"
                className={FIELD}
              />
            </View>

            <View className="gap-1.5">
              <Text className={LABEL}>{StaffTexts.emailLabel}</Text>
              <TextInput
                value={values.email}
                onChangeText={(email) => setValues({ ...values, email })}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="owner@shop.ru"
                className={FIELD}
              />
            </View>

            <View className="gap-1.5">
              <Text className={LABEL}>{StaffTexts.phoneLabel}</Text>
              <TextInput
                value={values.phone}
                onChangeText={(phone) => setValues({ ...values, phone })}
                keyboardType="phone-pad"
                placeholder="+992 900 00 00 00"
                className={FIELD}
              />
            </View>

            <View className="gap-1.5">
              <Text className={LABEL}>{StaffTexts.passwordLabel}</Text>
              <TextInput
                value={values.password}
                onChangeText={(password) => setValues({ ...values, password })}
                secureTextEntry
                placeholder="••••••"
                className={FIELD}
              />
              <Text className="text-xs text-muted">
                {editing ? StaffTexts.passwordHintEdit : StaffTexts.passwordHintCreate}
              </Text>
            </View>

            <If condition={Boolean(error)}>
              <Text className="text-sm font-medium text-danger">{error}</Text>
            </If>

            <View className="gap-2 pt-2">
              <Button
                title={StaffTexts.save}
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={!isStaffValid(values, Boolean(editing))}
                onPress={handleSubmit}
              />
              <Button
                title={StaffTexts.cancel}
                variant={ButtonVariants.secondary}
                onPress={() => setFormOpen(false)}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};
