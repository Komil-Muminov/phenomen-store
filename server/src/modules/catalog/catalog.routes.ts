import { NextFunction, Response, Router } from 'express';
import { ApiActions, ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, parsePagination, requireUuid, sendCreated, sendList, sendOk } from '@/shared/utils';
import {
  buildSearchParams,
  changeStock,
  createProduct,
  deactivateProduct,
  duplicateProduct,
  listStock,
  getCategories,
  getFacets,
  getProduct,
  listManagedProducts,
  searchProducts,
  updateProduct,
} from '@/modules/catalog/catalog.service';

const FACETS_ACTION = '/facets';

const MANAGE_SEARCH_ACTION = '/manage/search';

const STOCK_SEARCH_ACTION = '/stock/search';

const STOCK_UPDATE_ACTION = '/stock/update/:id';

const DUPLICATE_ACTION = '/duplicate/:id';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

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

productRouter.get(
  MANAGE_SEARCH_ACTION,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

      sendList(res, await listManagedProducts(requireTenant(req), page, limit, offset));
    } catch (error) {
      next(error);
    }
  },
);

productRouter.get(
  STOCK_SEARCH_ACTION,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

      sendList(res, await listStock(requireTenant(req), page, limit, offset));
    } catch (error) {
      next(error);
    }
  },
);

productRouter.patch(
  STOCK_UPDATE_ACTION,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await changeStock(requireTenant(req), id, req.body?.stock));
    } catch (error) {
      next(error);
    }
  },
);

productRouter.post(
  DUPLICATE_ACTION,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendCreated(res, await duplicateProduct(requireTenant(req), id));
    } catch (error) {
      next(error);
    }
  },
);

productRouter.post(
  ApiActions.create,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, await createProduct(requireTenant(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

productRouter.patch(
  ApiActions.update,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await updateProduct(requireTenant(req), id, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

productRouter.patch(
  ApiActions.deactivate,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await deactivateProduct(requireTenant(req), id));
    } catch (error) {
      next(error);
    }
  },
);

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
