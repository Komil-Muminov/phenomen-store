export { authRouter } from '@/modules/auth/auth.routes';
export {
  requestCode,
  verifyCode,
  getProfile,
  updateProfile,
  loginWithPassword,
  changePassword,
} from '@/modules/auth/auth.service';
export { AuthErrors, OtpSettings, UserStatus, normalizePhone } from '@/modules/auth/types';
export type { IUserRow } from '@/modules/auth/types';
