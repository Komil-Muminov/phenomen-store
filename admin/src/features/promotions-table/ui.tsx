import { Empty, Table } from 'antd';
import { IPromotion, PromotionTexts } from '@/features/promotions-table/model';
import { buildPromotionColumns } from '@/features/promotions-table/lib';

interface IProps {
  items: IPromotion[];
  isLoading: boolean;
  onEdit: (promotion: IPromotion) => void;
  onDelete: (promotion: IPromotion) => void;
}

export const PromotionsTable = ({ items, isLoading, onEdit, onDelete }: IProps) => (
  <Table
    rowKey="id"
    dataSource={items}
    loading={isLoading}
    columns={buildPromotionColumns({ onEdit, onDelete })}
    pagination={false}
    scroll={{ x: 900 }}
    locale={{ emptyText: <Empty description={PromotionTexts.empty} /> }}
  />
);
