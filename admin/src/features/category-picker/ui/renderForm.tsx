import { Form, Input, InputNumber, Modal, Select, Switch, Typography } from 'antd';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { ICategoryDraft, PickerTexts } from '@/features/category-picker/model';
import type { IShopCategory } from '@/entities/shop';

interface IProps {
  draft: ICategoryDraft | null;
  categories: IShopCategory[];
  isBusy: boolean;
  onChange: (patch: Partial<ICategoryDraft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RenderCategoryForm = ({
  draft,
  categories,
  isBusy,
  onChange,
  onSubmit,
  onCancel,
}: IProps) => (
  <Modal
    open={Boolean(draft)}
    width={480}
    title={draft?.id ? PickerTexts.renameTitle : PickerTexts.createTitle}
    okText="Сохранить"
    cancelText="Отмена"
    confirmLoading={isBusy}
    okButtonProps={{ disabled: !draft?.name.trim() }}
    onOk={onSubmit}
    onCancel={onCancel}
    destroyOnClose
  >
    <Form layout="vertical" requiredMark={false}>
      <Form.Item label={PickerTexts.nameLabel} className="mb-3!">
        <Input
          autoFocus
          size="large"
          value={draft?.name ?? ''}
          placeholder={PickerTexts.namePlaceholder}
          onChange={(event) => onChange({ name: event.target.value })}
          onPressEnter={onSubmit}
        />
      </Form.Item>

      <div className="flex flex-wrap gap-4">
        <Form.Item label={PickerTexts.parentLabel} className="mb-3! min-w-56 flex-1">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            value={draft?.parentId ?? undefined}
            placeholder={PickerTexts.parentPlaceholder}
            onChange={(parentId) => onChange({ parentId: parentId ?? null })}
            options={categories
              .filter((item) => item.id !== draft?.id)
              .map((item) => ({ value: item.id, label: item.name }))}
          />
        </Form.Item>

        <Form.Item
          label={PickerTexts.positionLabel}
          extra={PickerTexts.positionHint}
          className="mb-3! w-32"
        >
          <InputNumber
            min={0}
            step={10}
            value={draft?.position}
            onChange={(position) => onChange({ position: Number(position ?? 0) })}
            className="w-full!"
          />
        </Form.Item>
      </div>

      <Form.Item className="mb-3!">
        <ImageUploader
          value={draft?.imageUrl ?? ''}
          onChange={(imageUrl) => onChange({ imageUrl })}
          title={PickerTexts.imageLabel}
          hint={PickerTexts.imageHint}
          previewClass="h-24 w-24"
        />
      </Form.Item>

      <Form.Item className="mb-0!">
        <div className="flex items-center gap-3">
          <Switch
            checked={draft?.isActive !== false}
            onChange={(isActive) => onChange({ isActive })}
          />
          <Typography.Text className="text-sm! text-slate-600!">
            {PickerTexts.visibleLabel}
          </Typography.Text>
        </div>
      </Form.Item>
    </Form>
  </Modal>
);
