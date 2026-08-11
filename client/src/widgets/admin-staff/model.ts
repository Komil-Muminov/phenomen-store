export interface IStaffMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface IStaffValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const EMPTY_STAFF_VALUES: IStaffValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

export const StaffRoleLabels: Record<string, string> = {
  owner: 'владелец',
  admin: 'администратор',
  manager: 'менеджер',
};

export const StaffTexts = {
  title: 'Сотрудники',
  empty: 'Сотрудников пока нет',
  add: 'Добавить владельца',
  createTitle: 'Новый сотрудник',
  editTitle: 'Сотрудник магазина',
  nameLabel: 'Имя',
  emailLabel: 'Email',
  phoneLabel: 'Телефон',
  passwordLabel: 'Пароль',
  passwordHintCreate: 'Не короче 6 символов',
  passwordHintEdit: 'Пусто — пароль не меняется',
  contactRequired: 'Нужен email или телефон',
  save: 'Сохранить',
  cancel: 'Отмена',
  deleteTitle: 'Удалить сотрудника?',
  deleteHint: 'Он потеряет доступ к кабинету магазина',
  disabled: 'доступ отключён',
} as const;

export const toStaffValues = (member: IStaffMember): IStaffValues => ({
  name: member.name ?? '',
  email: member.email ?? '',
  phone: member.phone ?? '',
  password: '',
});

export const buildStaffPayload = (values: IStaffValues) => ({
  name: values.name.trim(),
  email: values.email.trim() || undefined,
  phone: values.phone.trim() || undefined,
  ...(values.password ? { password: values.password } : {}),
});

export const isStaffValid = (values: IStaffValues, editing: boolean): boolean => (
  values.name.trim().length > 0
  && (values.email.trim().length > 0 || values.phone.trim().length > 0)
  && (editing || values.password.length >= 6)
);
