import { Form, Input, InputNumber, Modal, Radio, Switch, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { AttributeTexts, IAttributeDraft } from '@/features/attribute-value-picker/model';

const ICON_BASE = 'flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-slate-400 opacity-0 transition-colors duration-200 focus-visible:opacity-100 group-hover:opacity-100';

interface ILabelProps {
  id: string;
  name: string;
  onRename: () => void;
  onDelete: () => void;
}

export const RenderAttributeLabel = ({ id, name, onRename, onDelete }: ILabelProps) => (
  <span className="group mb-1 flex items-center gap-1">
    <span className="text-sm font-medium text-slate-600">{name}</span>

    <Tooltip title="Переименовать характеристику">
      <button
        type="button"
        aria-label={`Переименовать характеристику ${name}`}
        data-attribute={id}
        className={`${ICON_BASE} hover:bg-indigo-50 hover:text-indigo-600`}
        onClick={onRename}
      >
        <EditOutlined className="text-xs" />
      </button>
    </Tooltip>

    <Tooltip title="Удалить характеристику">
      <button
        type="button"
        aria-label={`Удалить характеристику ${name}`}
        className={`${ICON_BASE} hover:bg-rose-50 hover:text-rose-600`}
        onClick={onDelete}
      >
        <DeleteOutlined className="text-xs" />
      </button>
    </Tooltip>
  </span>
);

interface IAddProps {
  title: string;
  onClick: () => void;
}

export const RenderAttributeAdd = ({ title, onClick }: IAddProps) => (
  <Tooltip title={title}>
    <button
      type="button"
      aria-label={title}
      onClick={onClick}
      className="flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-indigo-50/80 px-2.5 text-xs font-semibold text-indigo-600 transition-colors duration-200 hover:bg-indigo-600 hover:text-white"
    >
      <PlusOutlined />
      {title}
    </button>
  </Tooltip>
);

interface IModalProps {
  draft: IAttributeDraft | null;
  isBusy: boolean;
  onChange: (patch: Partial<IAttributeDraft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RenderAttributeModal = ({
  draft,
  isBusy,
  onChange,
  onSubmit,
  onCancel,
}: IModalProps) => (
  <Modal
    open={Boolean(draft)}
    width={480}
    title={draft?.id ? AttributeTexts.renameTitle : AttributeTexts.createTitle}
    okText="Сохранить"
    cancelText="Отмена"
    confirmLoading={isBusy}
    okButtonProps={{ disabled: !draft?.name.trim() }}
    onOk={onSubmit}
    onCancel={onCancel}
    destroyOnClose
  >
    <Form layout="vertical" requiredMark={false}>
      <Form.Item label={AttributeTexts.nameLabel} className="mb-3!">
        <Input
          autoFocus
          size="large"
          value={draft?.name ?? ''}
          placeholder={draft?.isVariantOption
            ? AttributeTexts.optionPlaceholder
            : AttributeTexts.detailPlaceholder}
          onChange={(event) => onChange({ name: event.target.value })}
          onPressEnter={onSubmit}
        />
      </Form.Item>

      <Form.Item
        label={AttributeTexts.kindLabel}
        extra={draft?.isVariantOption ? AttributeTexts.optionHint : AttributeTexts.detailHint}
        className="mb-3!"
      >
        <Radio.Group
          value={draft?.isVariantOption === true}
          onChange={(event) => onChange({ isVariantOption: event.target.value })}
          optionType="button"
          buttonStyle="solid"
          options={[
            { value: true, label: AttributeTexts.kindOption },
            { value: false, label: AttributeTexts.kindDetail },
          ]}
        />
      </Form.Item>

      <div className="flex flex-wrap items-start gap-4">
        <Form.Item className="mb-0! flex-1">
          <div className="flex items-center gap-3">
            <Switch
              checked={draft?.isFilterable !== false}
              onChange={(isFilterable) => onChange({ isFilterable })}
            />
            <Typography.Text className="text-sm! text-slate-600!">
              {AttributeTexts.filterableLabel}
            </Typography.Text>
          </div>
        </Form.Item>

        <Form.Item
          label={AttributeTexts.positionLabel}
          extra={AttributeTexts.positionHint}
          className="mb-0! w-32"
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
    </Form>
  </Modal>
);
