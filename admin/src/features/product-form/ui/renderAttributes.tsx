import { Typography } from 'antd';
import { If } from '@/shared/ui/If';
import {
  AttributeTexts,
  AttributeValuePicker,
  RenderAttributeAdd,
  RenderAttributeLabel,
} from '@/features/attribute-value-picker';
import type { IShopAttribute } from '@/entities/shop';

interface IProps {
  attributes: IShopAttribute[];
  values: Record<string, string>;
  isBusy: boolean;
  onChange: (code: string, value: string) => void;
  onSaveValues: (attributeId: string, values: string[]) => Promise<void>;
  onAdd: () => void;
  onRename: (attribute: IShopAttribute) => void;
  onDelete: (attribute: IShopAttribute) => void;
}

export const RenderAttributes = ({
  attributes,
  values,
  isBusy,
  onChange,
  onSaveValues,
  onAdd,
  onRename,
  onDelete,
}: IProps) => (
  <section className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <Typography.Text strong className="text-slate-800! font-semibold!">
        Характеристики
      </Typography.Text>

      <If condition={attributes.length === 0}>
        <RenderAttributeAdd title={AttributeTexts.addDetail} onClick={onAdd} />
      </If>
    </div>

    <If
      condition={attributes.length > 0}
      fallback={(
        <Typography.Text className="text-sm! text-slate-500!">
          Пока ни одной характеристики — добавьте, например, «Материал» или «Сезон»
        </Typography.Text>
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attributes.map((attribute) => (
          <div key={attribute.code} className="block">
            <RenderAttributeLabel
              id={attribute.id}
              name={attribute.name}
              onRename={() => onRename(attribute)}
              onDelete={() => onDelete(attribute)}
            />
            <AttributeValuePicker
              attribute={attribute}
              value={values[attribute.code] ?? ''}
              picked={[]}
              multiple={false}
              isBusy={isBusy}
              attributeLabel={AttributeTexts.addDetail}
              onChange={(next) => onChange(attribute.code, next)}
              onPick={() => undefined}
              onCreateAttribute={onAdd}
              onSaveValues={onSaveValues}
            />
          </div>
        ))}
      </div>
    </If>
  </section>
);
