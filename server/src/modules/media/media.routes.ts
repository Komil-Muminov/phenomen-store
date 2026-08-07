import { NextFunction, Response, Router } from 'express';
import multer from 'multer';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, sendCreated } from '@/shared/utils';
import { storeUpload } from '@/modules/media/media.service';
import { MAX_FILE_SIZE, MediaPaths } from '@/modules/media/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const FILE_FIELD = 'file';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const mediaRouter = Router();

mediaRouter.post(
  MediaPaths.upload,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  upload.single(FILE_FIELD),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, storeUpload(requireTenant(req), req.file));
    } catch (error) {
      next(error);
    }
  },
);
