import { NextFunction, Response, Router } from 'express';
import { HttpStatus, PlatformRoles } from '@/shared/config';
import { platformAuthMiddleware, platformRoleMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, pickString, sendOk } from '@/shared/utils';
import { checkMail, sendTestLetter } from '@/modules/mail/mail.service';
import { MailErrors, MailPaths } from '@/modules/mail/types';

const PLATFORM_ROLES = [PlatformRoles.superadmin, PlatformRoles.operator];

export const mailRouter = Router();

mailRouter.use(platformAuthMiddleware, platformRoleMiddleware(PLATFORM_ROLES));

mailRouter.get(MailPaths.status, async (_req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendOk(res, await checkMail());
  } catch (error) {
    next(error);
  }
});

mailRouter.post(MailPaths.test, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const to = pickString(body.email);

    if (!to.includes('@')) {
      throw new AppError(MailErrors.addressRequired, HttpStatus.badRequest);
    }

    await sendTestLetter(to, req.platform?.login ?? '');
    sendOk(res, { sent: true, to });
  } catch (error) {
    next(error);
  }
});
