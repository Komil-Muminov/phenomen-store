import type { ITenant, ITenantStaff } from '@/entities/tenant';

export interface ITenantCardValues {
  name: string;
  vertical: string;
  plan: string;
  bundleId?: string;
}

export interface ITenantCardHandlers {
  onSubmit: (values: ITenantCardValues) => void;
  onEditStaff: (staff: ITenantStaff) => void;
  onToggleStatus: (tenant: ITenant) => void;
  onEnterShop: (tenant: ITenant) => void;
  onDelete: (key: string) => void;
}

export const CardTitles = {
  main: 'Основное',
  enter: 'Кабинет магазина',
  staff: 'Сотрудники магазина',
  danger: 'Опасная зона',
} as const;

export const DRAWER_WIDTH = 560;
