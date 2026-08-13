import { Card, Progress, Skeleton, Tag, Typography } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AppRoutes } from '@/shared/config';
import { If } from '@/shared/ui/If';
import {
  IPlanState,
  PlanColors,
  PlanLabels,
  ResourceLabels,
  formatUsage,
  usagePercent,
} from '@/entities/plan';

interface IProps {
  state: IPlanState | null;
  isLoading: boolean;
}

const PlanCardTexts = {
  title: 'Тариф магазина',
  free: 'бесплатно',
  perMonth: 'сомони в месяц',
  upgrade: 'Расширить тариф',
  hint: 'Нужно больше товаров, баннеров или акций — напишите в поддержку платформы',
} as const;

const WARN_PERCENT = 80;

const pickStroke = (percent: number): string => (
  percent >= WARN_PERCENT ? '#f97316' : '#4f46e5'
);

export const PlanCard = ({ state, isLoading }: IProps) => (
  <Card className="mt-6! rounded-2xl! border-slate-200!">
    <If condition={!isLoading} fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
          <CrownOutlined />
        </span>
        <div className="flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <Typography.Text strong className="text-slate-900!">
              {PlanCardTexts.title}
            </Typography.Text>
            <Tag color={PlanColors[state?.plan.code ?? ''] ?? 'default'} className="m-0!">
              {PlanLabels[state?.plan.code ?? ''] ?? state?.plan.name}
            </Tag>
          </span>
          <Typography.Text className="block text-sm! text-slate-500!">
            {state?.plan.description}
          </Typography.Text>
          <Typography.Text className="text-sm! text-slate-500!">
            {state?.plan.price
              ? `${state.plan.price} ${PlanCardTexts.perMonth}`
              : PlanCardTexts.free}
          </Typography.Text>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(state?.usage ?? []).map((item) => (
          <div key={item.resource} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="flex items-center justify-between gap-2">
              <Typography.Text className="text-sm! text-slate-700!">
                {ResourceLabels[item.resource] ?? item.resource}
              </Typography.Text>
              <Typography.Text className="text-xs! text-slate-500!">
                {formatUsage(item)}
              </Typography.Text>
            </span>
            <Progress
              percent={usagePercent(item)}
              showInfo={false}
              size="small"
              strokeColor={pickStroke(usagePercent(item))}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Typography.Text className="text-sm! text-slate-500!">
          {PlanCardTexts.hint}
        </Typography.Text>
        <Link
          to={AppRoutes.shopTickets}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white transition-colors duration-200 hover:bg-indigo-500"
        >
          {PlanCardTexts.upgrade}
        </Link>
      </div>
    </If>
  </Card>
);
