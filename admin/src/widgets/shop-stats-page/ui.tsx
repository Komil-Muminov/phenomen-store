import { useState } from 'react';
import { Alert, Card, Segmented, Skeleton, Statistic, Typography } from 'antd';
import { ApiRoutes, QueryKeys, StaleTimeMs, UiMessages } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import {
  RenderBars,
  buildStatusRows,
  buildTopRows,
  buildTrendRows,
  maxOf,
} from '@/widgets/shop-stats-page/lib';
import {
  IStatsOverview,
  StatsPeriodOptions,
  StatsTexts,
  formatMoney,
} from '@/widgets/shop-stats-page/model';

const CARD_CLASS = 'rounded-2xl! border-slate-200!';

export const ShopStatsPage = () => {
  const [period, setPeriod] = useState<string>('month');

  const statsQuery = useGetQuery<IStatsOverview>(
    [QueryKeys.shopStats, period],
    ApiRoutes.shopStatsOverview,
    { scope: 'shop', params: { period }, staleTime: StaleTimeMs.short },
  );

  const data = statsQuery.data;
  const statusRows = data ? buildStatusRows(data) : [];
  const trendRows = data ? buildTrendRows(data) : [];
  const topRows = data ? buildTopRows(data) : [];

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={4} className="mb-0! text-slate-900!">
            {StatsTexts.title}
          </Typography.Title>
          <Typography.Text className="text-sm! text-slate-500!">
            {StatsTexts.subtitle}
          </Typography.Text>
        </div>

        <Segmented
          value={period}
          onChange={(value) => setPeriod(String(value))}
          options={[...StatsPeriodOptions]}
        />
      </header>

      <If condition={!statsQuery.isError} fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}>
        <If condition={!statsQuery.isLoading} fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className={CARD_CLASS}>
              <Statistic title={StatsTexts.revenue} value={formatMoney(data?.totals.revenue ?? 0)} />
            </Card>
            <Card className={CARD_CLASS}>
              <Statistic title={StatsTexts.orders} value={data?.totals.orders ?? 0} />
            </Card>
            <Card className={CARD_CLASS}>
              <Statistic title={StatsTexts.average} value={formatMoney(data?.totals.average ?? 0)} />
            </Card>
            <Card className={CARD_CLASS}>
              <Statistic title={StatsTexts.customers} value={data?.totals.customers ?? 0} />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card title={StatsTexts.byDay} className={CARD_CLASS}>
              <If
                condition={trendRows.length > 0}
                fallback={<Typography.Text className="text-slate-400!">{StatsTexts.empty}</Typography.Text>}
              >
                <RenderBars rows={trendRows} total={maxOf(trendRows)} money />
              </If>
            </Card>

            <Card title={StatsTexts.byStatus} className={CARD_CLASS}>
              <If
                condition={statusRows.length > 0}
                fallback={<Typography.Text className="text-slate-400!">{StatsTexts.empty}</Typography.Text>}
              >
                <RenderBars rows={statusRows} total={maxOf(statusRows)} />
              </If>
            </Card>

            <Card title={StatsTexts.top} className={CARD_CLASS}>
              <If
                condition={topRows.length > 0}
                fallback={<Typography.Text className="text-slate-400!">{StatsTexts.empty}</Typography.Text>}
              >
                <RenderBars rows={topRows} total={maxOf(topRows)} money />
              </If>
            </Card>

            <Card title={StatsTexts.lowStock} className={CARD_CLASS}>
              <If
                condition={(data?.lowStock.length ?? 0) > 0}
                fallback={<Typography.Text className="text-slate-400!">{StatsTexts.emptyStock}</Typography.Text>}
              >
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {(data?.lowStock ?? []).map((row) => (
                    <li key={row.sku} className="flex items-baseline justify-between gap-3">
                      <Typography.Text className="text-sm! text-slate-700!">
                        {row.name}
                        <span className="ml-2 text-xs text-slate-400">{row.sku}</span>
                      </Typography.Text>
                      <Typography.Text strong className={row.stock === 0 ? 'text-rose-600!' : 'text-amber-600!'}>
                        {`${row.stock} ${StatsTexts.quantity}`}
                      </Typography.Text>
                    </li>
                  ))}
                </ul>
              </If>
            </Card>
          </div>

          <Card title={StatsTexts.catalog} className={CARD_CLASS}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Statistic title={StatsTexts.products} value={data?.catalog.products ?? 0} />
              <Statistic title={StatsTexts.activeProducts} value={data?.catalog.activeProducts ?? 0} />
              <Statistic title={StatsTexts.categories} value={data?.catalog.categories ?? 0} />
              <Statistic title={StatsTexts.outOfStock} value={data?.catalog.outOfStock ?? 0} />
            </div>
          </Card>
        </If>
      </If>
    </section>
  );
};
