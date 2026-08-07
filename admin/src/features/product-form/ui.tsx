import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { UiMessages } from '@/shared/config';
import { RenderAttributes } from '@/features/product-form/ui/renderAttributes';
import { RenderVariants } from '@/features/product-form/ui/renderVariants';
import {
  buildMatrix,
  IProductFormValues,
  IProductPayload,
  IVariantRow,
  mergeRows,
  readSelectedOptions,
  readVariantRows,
  splitAttributes,
} from '@/features/product-form/model';
import type { IShopAttribute, IShopCategory, IShopProduct } from '@/entities/shop';

interface IProps {
  open: boolean;
  editing: IShopProduct | null;
  categories: IShopCategory[];
  attributes: IShopAttribute[];
  isSaving: boolean;
  onSubmit: (payload: IProductPayload) => void;
  onCancel: () => void;
}

export const ProductForm = ({
  open,
  editing,
  categories,
  attributes,
  isSaving,
  onSubmit,
  onCancel,
}: IProps) => {
  const [form] = Form.useForm<IProductFormValues>();
  const [details, setDetails] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [rows, setRows] = useState<IVariantRow[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [basePrice, setBasePrice] = useState(0);

  const groups = useMemo(() => splitAttributes(attributes), [attributes]);
  const optionCodes = useMemo(() => groups.options.map((item) => item.code), [groups.options]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      name: editing?.name ?? '',
      brand: editing?.brand ?? '',
      description: editing?.description ?? '',
      basePrice: editing?.price ?? 0,
      oldPrice: editing?.oldPrice ?? null,
      categoryId: editing?.categoryId ?? null,
    });
    setDetails(editing?.attributes ?? {});
    setSelected(readSelectedOptions(editing, optionCodes));
    setRows(readVariantRows(editing));
    setHasVariants((editing?.variants?.length ?? 0) > 0);
    setBasePrice(editing?.price ?? 0);
  }, [open, editing, optionCodes, form]);

  const handleSelect = useCallback((code: string, values: string[]) => {
    setSelected((current) => {
      const next = { ...current, [code]: values };

      setRows((previous) => mergeRows(buildMatrix(optionCodes, next), previous));

      return next;
    });
  }, [optionCodes]);

  const handleRowChange = useCallback((
    key: string,
    field: 'price' | 'stock',
    value: number | null,
  ) => {
    setRows((current) => current.map((row) => (
      row.key === key ? { ...row, [field]: field === 'stock' ? (value ?? 0) : value } : row
    )));
  }, []);

  const handleFinish = useCallback((values: IProductFormValues) => {
    onSubmit({
      ...values,
      attributes: details,
      variants: hasVariants
        ? rows.map((row) => ({
          options: row.options,
          price: row.price ?? undefined,
          stock: row.stock,
        }))
        : [],
    });
  }, [onSubmit, details, hasVariants, rows]);

  return (
    <Modal
      open={open}
      title={editing ? 'Редактирование товара' : 'Новый товар'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
      width={760}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Футболка базовая" autoFocus />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Form.Item
            name="basePrice"
            label="Цена, смн"
            rules={[{ required: true, message: UiMessages.required }]}
          >
            <InputNumber min={0} step={10} className="w-full!" onChange={(v) => setBasePrice(Number(v ?? 0))} />
          </Form.Item>

          <Form.Item name="oldPrice" label="Старая цена, смн">
            <InputNumber min={0} step={10} className="w-full!" />
          </Form.Item>

          <Form.Item name="categoryId" label="Категория">
            <Select
              allowClear
              placeholder="Без категории"
              options={categories.map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="brand" label="Бренд">
          <Input placeholder="PHENOMEN" />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={2} placeholder="Короткое описание товара" />
        </Form.Item>
      </Form>

      <RenderAttributes
        attributes={groups.details}
        values={details}
        onChange={(code, value) => setDetails((current) => ({ ...current, [code]: value }))}
      />

      <RenderVariants
        options={groups.options}
        enabled={hasVariants}
        selected={selected}
        rows={rows}
        basePrice={basePrice}
        onToggle={setHasVariants}
        onSelect={handleSelect}
        onRowChange={handleRowChange}
      />
    </Modal>
  );
};
