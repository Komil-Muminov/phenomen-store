import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, GuestHeader, HttpStatus } from '@/shared/config';
import { authMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, pickString, sendOk } from '@/shared/utils';
import {
  changePassword,
  getProfile,
  loginWithPassword,
  registerPushToken,
  confirmEmailChange,
  requestCode,
  requestEmailChange,
  updateProfile,
  verifyCode,
} from '@/modules/auth/auth.service';

const AuthActions = {
  login: '/login',
  password: '/password/update',
  code: '/code',
  verify: '/verify',
  profile: '/profile',
  update: '/update',
  emailCode: '/email/code',
  emailUpdate: '/email/update',
  push: '/push',
} as const;

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

const requireUserId = (req: IAppRequest): string => {
  if (!req.user) {
    throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
  }

  return req.user.id;
};

export const authRouter = Router();

authRouter.post(AuthActions.login, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;

    sendOk(res, await loginWithPassword(requireTenant(req), body.login, body.password));
  } catch (error) {
    next(error);
  }
});

authRouter.post(AuthActions.code, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendOk(res, await requestCode(requireTenant(req), req.body?.email));
  } catch (error) {
    next(error);
  }
});

authRouter.post(AuthActions.verify, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);
    const guestKey = pickString(req.headers[GuestHeader]) || pickString(req.body?.guestKey) || null;

    sendOk(res, await verifyCode(tenant, req.body?.email, req.body?.code, guestKey));
  } catch (error) {
    next(error);
  }
});

authRouter.patch(
  AuthActions.password,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;

      sendOk(res, await changePassword(
        requireTenant(req),
        requireUserId(req),
        body.currentPassword,
        body.newPassword,
      ));
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  AuthActions.emailCode,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await requestEmailChange(requireTenant(req), requireUserId(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

authRouter.patch(
  AuthActions.emailUpdate,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await confirmEmailChange(requireTenant(req), requireUserId(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

authRouter.get(
  AuthActions.profile,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await getProfile(requireTenant(req), requireUserId(req)));
    } catch (error) {
      next(error);
    }
  },
);

authRouter.patch(
  AuthActions.update,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await updateProfile(requireTenant(req), requireUserId(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  AuthActions.push,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await registerPushToken(requireTenant(req), requireUserId(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);
