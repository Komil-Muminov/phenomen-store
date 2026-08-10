import { Pagination as AntPagination } from 'antd';
import { If } from '@/shared/ui/If';

interface IProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export const ListPagination = ({ current, pageSize, total, onChange }: IProps) => (
  <If condition={total > pageSize}>
    <div className="mt-4 flex justify-end">
      <AntPagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger={false}
        onChange={onChange}
      />
    </div>
  </If>
);
