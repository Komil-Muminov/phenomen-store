import { Response } from 'express';
import { HttpStatus, Pagination } from '@/shared/config';
import { IListResult, IPaginationParams } from '@/shared/types';

export class AppError extends Error {
  public readonly status: number;

  public readonly details?: unknown;

  constructor(message: string, status: number = HttpStatus.badRequest, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const sendOk = <T>(res: Response, data: T): void => {
  res.status(HttpStatus.ok).json({ success: true, data });
};

export const sendCreated = <T>(res: Response, data: T): void => {
  res.status(HttpStatus.created).json({ success: true, data });
};

export const sendList = <T>(res: Response, result: IListResult<T>): void => {
  res.status(HttpStatus.ok).json({ success: true, ...result });
};

export const parsePagination = (query: Record<string, unknown>): IPaginationParams => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : Pagination.defaultPage;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.floor(rawLimit), Pagination.maxLimit)
    : Pagination.defaultLimit;

  return { page, limit, offset: (page - 1) * limit };
};

export const requireFields = (payload: Record<string, unknown>, fields: string[]): void => {
  const missing = fields.filter((field) => {
    const value = payload?.[field];

    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new AppError(`Не заполнены обязательные поля: ${missing.join(', ')}`, HttpStatus.badRequest);
  }
};

export const requireUuid = (value: unknown, fieldName: string): string => {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new AppError(`Некорректный идентификатор: ${fieldName}`, HttpStatus.badRequest);
  }

  return value;
};

export const pickString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
);

export const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);
