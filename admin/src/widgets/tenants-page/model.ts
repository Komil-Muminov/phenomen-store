import type { ITenant } from '@/entities/tenant';

export interface ITenantsPageState {
  formOpen: boolean;
  ownerOpen: boolean;
  editing: ITenant | null;
  target: ITenant | null;
}

export const INITIAL_STATE: ITenantsPageState = {
  formOpen: false,
  ownerOpen: false,
  editing: null,
  target: null,
};

export const buildUpdateUrl = (base: string, id: string): string => `${base}/${id}`;
