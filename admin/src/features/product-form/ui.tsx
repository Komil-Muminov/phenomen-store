import { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Form, Input, InputNumber, Modal, Select } from 'antd';
import { ProductUnits, UiMessages } from '@/shared/config';
import { RenderAttributes } from '@/features/product-form/ui/renderAttributes';
import { RenderMedia } from '@/features/product-form/ui/renderMedia';
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
import { CategoryPicker, ICategoryPickerHandlers } from '@/features/category-picker';
import {
  AttributeTexts,
  DEFAULT_ATTRIBUTE_POSITION,
  IAttributeDraft,
  IAttributeHandlers,
  RenderAttributeModal,
  toAttributePayload,
} from '@/features/attribute-value-picker';
import type { IShopAttribute, IShopCategory, IShopProduct } from '@/entities/shop';

interface IProps extends ICategoryPickerHandlers, IAttributeHandlers {
  open: boolean;
  editing: IShopProduct | null;
  categories: IShopCategory[];
  attributes: IShopAttribute[];
  isSaving: boolean;
  isCategoryBusy: boolean;
  isAttributeBusy: boolean;
  onSubmit: (payload: IProductPayload) => void;
  onCancel: () => void;
}

export const ProductForm = ({
  open,
  editing,
  categories,
  attributes,
  isSaving,
  isCategoryBusy,
  isAttributeBusy,
  onSubmit,
  onCancel,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateAttribute,
  onUpdateAttribute,
  onDeleteAttribute,
  onSaveValues,
}: IProps) => {
  const { modal } = AntApp.useApp();
  const [attributeDraft, setAttributeDraft] = useState<IAttributeDraft | null>(null);
  const [form] = Form.useForm<IProductFormValues>();
  const [details, setDetails] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [rows, setRows] = useState<IVariantRow[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [media, setMedia] = useState<string[]>([]);

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
      unit: editing?.unit ?? 'piece',
    });
    setDetails(editing?.attributes ?? {});
    setSelected(readSelectedOptions(editing, optionCodes));
    setRows(readVariantRows(editing));
    setHasVariants((editing?.variants?.length ?? 0) > 0);
    setBasePrice(editing?.price ?? 0);
    setMedia(editing?.media ?? []);
  }, [open, editing, optionCodes, form]);

  const handleAttributeSubmit = useCallback(async () => {
    if (!attributeDraft?.name.trim()) {
      return;
    }

    const payload = toAttributePayload(attributeDraft);

    await (attributeDraft.id
      ? onUpdateAttribute(attributeDraft.id, payload)
      : onCreateAttribute(payload));

    setAttributeDraft(null);
  }, [attributeDraft, onCreateAttribute, onUpdateAttribute]);

  const handleDeleteAttribute = useCallback((id: string, name: string) => {
    modal.confirm({
      title: AttributeTexts.deleteTitle,
      content: `«${name}». ${AttributeTexts.deleteHint}`,
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => onDeleteAttribute(id),
    });
  }, [modal, onDeleteAttribute]);

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
      media: media.filter(Boolean),
      variants: hasVariants
        ? rows.map((row) => ({
          options: row.options,
          price: row.price ?? undefined,
          stock: row.stock,
        }))
        : [],
    });
  }, [onSubmit, details, hasVariants, rows, media]);

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
            <CategoryPicker
              categories={categories}
              isBusy={isCategoryBusy}
              onCreateCategory={onCreateCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="unit"
          label="Единица измерения"
          extra="Для весового товара цена указывается за килограмм, покупатель берёт нужный вес"
        >
          <Select
            options={ProductUnits.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Form.Item>

        <Form.Item name="brand" label="Бренд">
          <Input placeholder="PHENOMEN" />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={2} placeholder="Короткое описание товара" />
        </Form.Item>
      </Form>

      <RenderMedia urls={media} onChange={setMedia} />

      <RenderAttributes
        attributes={groups.details}
        values={details}
        isBusy={isAttributeBusy}
        onChange={(code, value) => setDetails((current) => ({ ...current, [code]: value }))}
        onSaveValues={onSaveValues}
        onAdd={() => setAttributeDraft({
          id: null,
          name: '',
          isVariantOption: false,
          isFilterable: true,
          position: DEFAULT_ATTRIBUTE_POSITION,
        })}
        onRename={(attribute) => setAttributeDraft({
          id: attribute.id,
          name: attribute.name,
          isVariantOption: attribute.isVariantOption,
          isFilterable: attribute.isFilterable,
          position: attribute.position,
        })}
        onDelete={(attribute) => handleDeleteAttribute(attribute.id, attribute.name)}
      />

      <RenderVariants
        options={groups.options}
        isBusy={isAttributeBusy}
        enabled={hasVariants}
        selected={selected}
        rows={rows}
        basePrice={basePrice}
        onToggle={setHasVariants}
        onSelect={handleSelect}
        onRowChange={handleRowChange}
        onSaveValues={onSaveValues}
        onAdd={() => setAttributeDraft({
          id: null,
          name: '',
          isVariantOption: true,
          isFilterable: true,
          position: DEFAULT_ATTRIBUTE_POSITION,
        })}
        onRename={(attribute) => setAttributeDraft({
          id: attribute.id,
          name: attribute.name,
          isVariantOption: attribute.isVariantOption,
          isFilterable: attribute.isFilterable,
          position: attribute.position,
        })}
        onDelete={(attribute) => handleDeleteAttribute(attribute.id, attribute.name)}
      />

      <RenderAttributeModal
        draft={attributeDraft}
        isBusy={isAttributeBusy}
        onChange={(patch) => setAttributeDraft((current) => (current ? { ...current, ...patch } : current))}
        onSubmit={handleAttributeSubmit}
        onCancel={() => setAttributeDraft(null)}
      />
    </Modal>
  );
};
