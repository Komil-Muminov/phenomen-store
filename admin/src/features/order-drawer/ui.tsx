import { Drawer, Skeleton, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import type { IOrderDetail } from '@/entities/shop';
import { IDeliveryValues, OrderDrawerTexts } from '@/features/order-drawer/model';
import { RenderDelivery } from '@/features/order-drawer/ui/renderDelivery';
import { RenderPayment } from '@/features/order-drawer/ui/renderPayment';

interface IProps {
  order: IOrderDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  delivery: IDeliveryValues;
  note: string;
  isReviewing: boolean;
  isSavingDelivery: boolean;
  onNote: (value: string) => void;
  onReview: (accepted: boolean) => void;
  onDelivery: (values: IDeliveryValues) => void;
  onSaveDelivery: () => void;
  onClose: () => void;
}

export const OrderDrawer = ({
  order,
  isOpen,
  isLoading,
  delivery,
  note,
  isReviewing,
  isSavingDelivery,
  onNote,
  onReview,
  onDelivery,
  onSaveDelivery,
  onClose,
}: IProps) => (
  <Drawer
    open={isOpen}
    onClose={onClose}
    width={560}
    title={`${OrderDrawerTexts.title} ${order?.number ?? ''}`}
  >
    <If condition={!isLoading} fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
      <div className="flex flex-col gap-4">
        <Typography.Text className="text-sm! text-slate-500!">
          {`${order?.totals.grandTotal ?? 0} ${order?.totals.currency ?? ""}`}
        </Typography.Text>

        <RenderPayment
          payment={order?.payment ?? null}
          note={note}
          isSaving={isReviewing}
          onNote={onNote}
          onReview={onReview}
        />

        <RenderDelivery
          values={delivery}
          history={order?.history ?? []}
          isSaving={isSavingDelivery}
          onChange={onDelivery}
          onSave={onSaveDelivery}
        />
      </div>
    </If>
  </Drawer>
);
