import { NextFunction, Response, Router } from 'express';
import { ApiActions, ErrorMessages, HttpStatus } from '@/shared/config';
import { IAppRequest } from '@/shared/types';
import { AppError, parsePagination, requireUuid, sendList, sendOk } from '@/shared/utils';
import {
  buildSearchParams,
  getCategories,
  getFacets,
  getProduct,
  searchProducts,
} from '@/modules/catalog/catalog.service';

const FACETS_ACTION = '/facets';

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const productRouter = Router();

export const categoryRouter = Router();

productRouter.get(ApiActions.search, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const params = buildSearchParams(req.query as Record<string, unknown>, page, limit);

    sendList(res, await searchProducts(tenant, params, page));
  } catch (error) {
    next(error);
  }
});

productRouter.get(FACETS_ACTION, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);
    const categoryId = typeof req.query.categoryId === 'string' && req.query.categoryId.length > 0
      ? requireUuid(req.query.categoryId, 'categoryId')
      : null;

    sendOk(res, await getFacets(tenant, categoryId));
  } catch (error) {
    next(error);
  }
});

productRouter.get(ApiActions.get, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);

    sendOk(res, await getProduct(tenant, requireUuid(req.params.id, 'id')));
  } catch (error) {
    next(error);
  }
});

categoryRouter.get(ApiActions.search, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendOk(res, await getCategories(requireTenant(req)));
  } catch (error) {
    next(error);
  }
});
