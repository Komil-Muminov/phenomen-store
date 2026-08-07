import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Env, HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError } from '@/shared/utils';
import {
  ALLOWED_MIME_TYPES,
  IUploadResult,
  MAX_FILE_SIZE,
  MIME_EXTENSIONS,
  MediaErrors,
  UPLOADS_DIR,
  UPLOADS_ROUTE,
} from '@/modules/media/types';

const RANDOM_BYTES = 8;

export const resolveUploadsRoot = (): string => path.resolve(process.cwd(), '..', UPLOADS_DIR);

export const ensureUploadsRoot = (): string => {
  const root = resolveUploadsRoot();

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  return root;
};

export const isAllowedType = (mimeType: string): boolean => (
  (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)
);

export const storeUpload = (
  tenant: ITenantContext,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer } | undefined,
): IUploadResult => {
  if (!file) {
    throw new AppError(MediaErrors.fileRequired, HttpStatus.badRequest);
  }

  if (!isAllowedType(file.mimetype)) {
    throw new AppError(MediaErrors.typeNotAllowed, HttpStatus.badRequest);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(MediaErrors.tooLarge, HttpStatus.badRequest);
  }

  const tenantDir = path.join(ensureUploadsRoot(), tenant.id);

  if (!fs.existsSync(tenantDir)) {
    fs.mkdirSync(tenantDir, { recursive: true });
  }

  const extension = MIME_EXTENSIONS[file.mimetype] ?? '.bin';
  const fileName = `${Date.now()}-${crypto.randomBytes(RANDOM_BYTES).toString('hex')}${extension}`;

  fs.writeFileSync(path.join(tenantDir, fileName), file.buffer);

  return {
    url: `${Env.publicUrl}${UPLOADS_ROUTE}/${tenant.id}/${fileName}`,
    name: file.originalname,
    size: file.size,
  };
};
