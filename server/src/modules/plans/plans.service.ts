import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { countResource, countResources } from '@/modules/plans/plans.db';
import {
  DEFAULT_PLAN,
  IPlan,
  IPlanUsage,
  PlanErrors,
  PlanResources,
  Plans,
  TPlanResource,
  buildLimitMessage,
} from '@/modules/plans/types';

const ALL_RESOURCES = Object.values(PlanResources);

export const resolvePlan = (code: string): IPlan => (
  Plans.find((plan) => plan.code === code) ?? Plans[0]
);

export const isKnownPlan = (code: string): boolean => (
  Plans.some((plan) => plan.code === code)
);

export const pickPlanCode = (value: unknown): string => {
  const code = pickString(value, DEFAULT_PLAN);

  if (!isKnownPlan(code)) {
    throw new AppError(PlanErrors.unknownPlan, HttpStatus.badRequest);
  }

  return code;
};

export const ensurePlanLimit = async (
  tenant: ITenantContext,
  resource: TPlanResource,
  adding = 1,
): Promise<void> => {
  const limit = resolvePlan(tenant.plan).limits[resource];

  if (limit === null) {
    return;
  }

  const used = await countResource(tenant.id, resource);

  if (used + adding > limit) {
    throw new AppError(buildLimitMessage(resource, limit), HttpStatus.conflict);
  }
};

export const getPlanUsage = async (tenant: ITenantContext) => {
  const plan = resolvePlan(tenant.plan);
  const counts = await countResources(tenant.id, ALL_RESOURCES);
  const usage: IPlanUsage[] = ALL_RESOURCES.map((resource) => ({
    resource,
    used: counts[resource] ?? 0,
    limit: plan.limits[resource],
  }));

  return { plan, usage };
};

export const listPlans = () => ({ items: Plans });
