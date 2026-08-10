import { useCallback, useState } from 'react';
import { App as AntApp, AutoComplete, Input, Modal, Select, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import {
  EMPTY_VALUE_DRAFT,
  IValueDraft,
  ValueTexts,
  appendValue,
  removeValue,
  replaceValue,
} from '@/features/attribute-value-picker/model';
import { RenderPopup, RenderValueRow } from '@/features/attribute-value-picker/ui/renderRow';
import type { IShopAttribute } from '@/entities/shop';

interface IProps {
  attribute: IShopAttribute;
  value: string;
  picked: string[];
  multiple: boolean;
  isBusy: boolean;
  attributeLabel: string;
  onChange: (value: string) => void;
  onPick: (values: string[]) => void;
  onCreateAttribute: () => void;
  onSaveValues: (attributeId: string, values: string[]) => Promise<void>;
}

const POPUP_CLASS = 'min-w-64! rounded-2xl! p-1.5! shadow-lg!';

export const AttributeValuePicker = ({
  attribute,
  value,
  picked,
  multiple,
  isBusy,
  attributeLabel,
  onChange,
  onPick,
  onCreateAttribute,
  onSaveValues,
}: IProps) => {
  const { modal } = AntApp.useApp();
  const [draft, setDraft] = useState<IValueDraft | null>(null);
  const [open, setOpen] = useState(false);

  const startCreate = useCallback(() => {
    setOpen(false);
    setDraft(EMPTY_VALUE_DRAFT);
  }, []);

  const startRename = useCallback((item: string) => {
    setOpen(false);
    setDraft({ original: item, name: item });
  }, []);

  const handleSave = useCallback(async () => {
    const next = draft?.name.trim() ?? '';

    if (!next) {
      return;
    }

    const original = draft?.original ?? null;

    await onSaveValues(
      attribute.id,
      original
        ? replaceValue(attribute.values, original, next)
        : appendValue(attribute.values, next),
    );

    if (multiple) {
      onPick(original ? replaceValue(picked, original, next) : appendValue(picked, next));
    } else if (!original || value === original) {
      onChange(next);
    }

    setDraft(null);
  }, [draft, attribute, multiple, picked, value, onChange, onPick, onSaveValues]);

  const handleDelete = useCallback((item: string) => {
    setOpen(false);
    modal.confirm({
      title: ValueTexts.deleteTitle,
      content: `«${item}». ${ValueTexts.deleteHint}`,
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => onSaveValues(attribute.id, removeValue(attribute.values, item)).then(() => {
        if (multiple) {
          onPick(removeValue(picked, item));
        } else if (value === item) {
          onChange('');
        }
      }),
    });
  }, [modal, attribute, multiple, picked, value, onChange, onPick, onSaveValues]);

  const options = attribute.values.map((item) => ({
    value: item,
    label: <RenderValueRow item={item} onRename={startRename} onDelete={handleDelete} />,
  }));

  const renderPopup = useCallback((menu: React.ReactNode) => (
    <RenderPopup
      menu={menu}
      hasValues={attribute.values.length > 0}
      attributeLabel={attributeLabel}
      onCreate={startCreate}
      onCreateAttribute={onCreateAttribute}
    />
  ), [attribute.values.length, attributeLabel, startCreate, onCreateAttribute]);

  return (
    <>
      <If
        condition={multiple}
        fallback={(
          <AutoComplete
            allowClear
            open={open}
            value={value}
            options={options}
            placeholder={ValueTexts.placeholder}
            className="w-full"
            classNames={{ popup: { root: POPUP_CLASS } }}
            onDropdownVisibleChange={setOpen}
            onChange={(next) => onChange(next ?? '')}
            filterOption={(input, option) => (
              String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
            )}
            dropdownRender={renderPopup}
          />
        )}
      >
        <Select
          mode="tags"
          open={open}
          value={picked}
          options={options}
          optionFilterProp="value"
          placeholder={ValueTexts.placeholder}
          className="w-full"
          classNames={{ popup: { root: POPUP_CLASS } }}
          onDropdownVisibleChange={setOpen}
          onChange={onPick}
          dropdownRender={renderPopup}
        />
      </If>

      <Modal
        open={Boolean(draft)}
        width={440}
        title={draft?.original ? ValueTexts.renameTitle : ValueTexts.createTitle}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={isBusy}
        okButtonProps={{ disabled: !draft?.name.trim() }}
        onOk={handleSave}
        onCancel={() => setDraft(null)}
        destroyOnClose
      >
        <Typography.Text className="mb-1.5! block text-sm! font-medium! text-slate-700!">
          {`${ValueTexts.nameLabel} — ${attribute.name}`}
        </Typography.Text>

        <Input
          autoFocus
          size="large"
          value={draft?.name ?? ''}
          placeholder={ValueTexts.namePlaceholder}
          onChange={(event) => setDraft((current) => (
            current ? { ...current, name: event.target.value } : current
          ))}
          onPressEnter={handleSave}
        />
      </Modal>
    </>
  );
};
