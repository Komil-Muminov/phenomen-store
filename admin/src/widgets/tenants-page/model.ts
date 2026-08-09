import type { ITenant, ITenantStaff } from '@/entities/tenant';

export interface ITenantsPageState {
  formOpen: boolean;
  cardOpen: boolean;
  staffOpen: boolean;
  target: ITenant | null;
  editingStaff: ITenantStaff | null;
}

export const INITIAL_STATE: ITenantsPageState = {
  formOpen: false,
  cardOpen: false,
  staffOpen: false,
  target: null,
  editingStaff: null,
};

export const buildUpdateUrl = (base: string, id: string): string => `${base}/${id}`;

export const buildStaffUrl = (base: string, id: string, staffId: string): string => (
  `${base}/${id}/${staffId}`
);
