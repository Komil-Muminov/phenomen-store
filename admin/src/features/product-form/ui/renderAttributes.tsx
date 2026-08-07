import { AutoComplete, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import type { IShopAttribute } from '@/entities/shop';

interface IProps {
  attributes: IShopAttribute[];
  values: Record<string, string>;
  onChange: (code: string, value: string) => void;
}

export const RenderAttributes = ({ attributes, values, onChange }: IProps) => (
  <If condition={attributes.length > 0}>
    <section className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <Typography.Text strong className="mb-3! block text-brand-text!">
        Характеристики
      </Typography.Text>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attributes.map((attribute) => (
          <label key={attribute.code} className="block">
            <span className="mb-1 block text-sm text-slate-600">{attribute.name}</span>
            <AutoComplete
              value={values[attribute.code] ?? ''}
              onChange={(next) => onChange(attribute.code, next)}
              options={attribute.values.map((item) => ({ value: item }))}
              filterOption={(input, option) => (
                String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
              )}
              placeholder="Выберите или впишите своё"
              className="w-full"
              allowClear
            />
          </label>
        ))}
      </div>
    </section>
  </If>
);
