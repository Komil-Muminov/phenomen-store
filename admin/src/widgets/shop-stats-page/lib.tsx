import { Progress, Typography } from 'antd';
import { OrderStatusLabels } from '@/shared/config';
import { IStatsOverview, StatsTexts, formatDay, formatMoney } from '@/widgets/shop-stats-page/model';

interface IBarsProps {
  rows: { label: string; value: number; hint?: string }[];
  total: number;
  money?: boolean;
}

export const RenderBars = ({ rows, total, money = false }: IBarsProps) => (
  <div className="flex flex-col gap-3">
    {rows.map((row) => (
      <div key={row.label} className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <Typography.Text className="text-sm! text-slate-700!">{row.label}</Typography.Text>
          <Typography.Text strong className="text-sm! text-slate-900!">
            {money ? formatMoney(row.value) : row.value}
            {row.hint ? <span className="ml-1 text-xs font-normal text-slate-400">{row.hint}</span> : null}
          </Typography.Text>
        </div>
        <Progress
          percent={total > 0 ? Math.round((row.value / total) * 100) : 0}
          showInfo={false}
          strokeColor="#6366f1"
          size="small"
        />
      </div>
    ))}
  </div>
);

export const buildStatusRows = (data: IStatsOverview) => data.statuses.map((row) => ({
  label: OrderStatusLabels[row.status] ?? row.status,
  value: row.total,
}));

export const buildTrendRows = (data: IStatsOverview) => data.trend.map((row) => ({
  label: formatDay(row.day),
  value: row.revenue,
  hint: `${row.orders} зак.`,
}));

export const buildTopRows = (data: IStatsOverview) => data.topProducts.map((row) => ({
  label: row.name,
  value: row.revenue,
  hint: `${row.quantity} ${StatsTexts.quantity}`,
}));

export const maxOf = (rows: { value: number }[]): number => (
  rows.reduce((top, row) => Math.max(top, row.value), 0)
);
