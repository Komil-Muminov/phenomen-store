export const MediaPaths = {
  upload: '/upload',
} as const;

export const MediaErrors = {
  fileRequired: 'Файл не передан',
  typeNotAllowed: 'Допустимы только изображения JPEG, PNG, WEBP или GIF',
  tooLarge: 'Файл больше 5 МБ',
} as const;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const UPLOADS_DIR = 'uploads';

export const UPLOADS_ROUTE = '/uploads';

export interface IUploadResult {
  url: string;
  name: string;
  size: number;
}
