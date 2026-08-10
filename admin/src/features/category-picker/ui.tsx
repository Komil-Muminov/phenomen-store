import { useCallback, useState } from 'react';
import { App as AntApp, Button, Divider, Input, Modal, Select, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import {
  EMPTY_DRAFT,
  ICategoryDraft,
  ICategoryPickerHandlers,
  PickerTexts,
} from '@/features/category-picker/model';
import type { IShopCategory } from '@/entities/shop';

interface IProps extends ICategoryPickerHandlers {
  value?: string | null;
  onChange?: (value: string | null) => void;
  categories: IShopCategory[];
  isBusy: boolean;
}

export const CategoryPicker = ({
  value,
  onChange,
  categories,
  isBusy,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
}: IProps) => {
  const { modal } = AntApp.useApp();
  const [draft, setDraft] = useState<ICategoryDraft | null>(null);
  const [open, setOpen] = useState(false);

  const closeDraft = useCallback(() => setDraft(null), []);

  const startCreate = useCallback(() => {
    setOpen(false);
    setDraft(EMPTY_DRAFT);
  }, []);

  const startRename = useCallback((category: IShopCategory) => {
    setOpen(false);
    setDraft({ id: category.id, name: category.name });
  }, []);

  const handleSave = useCallback(async () => {
    const name = draft?.name.trim() ?? '';

    if (!name) {
      return;
    }

    await (draft?.id ? onRenameCategory(draft.id, name) : onCreateCategory(name));
    setDraft(null);
  }, [draft, onCreateCategory, onRenameCategory]);

  const handleDelete = useCallback((category: IShopCategory) => {
    setOpen(false);
    modal.confirm({
      title: PickerTexts.deleteTitle,
      content: `«${category.name}». ${PickerTexts.deleteHint}`,
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => onDeleteCategory(category.id).then(() => {
        if (value === category.id) {
          onChange?.(null);
        }
      }),
    });
  }, [modal, onDeleteCategory, onChange, value]);

  return (
    <>
      <Select
        allowClear
        showSearch
        open={open}
        value={value ?? undefined}
        optionFilterProp="label"
        placeholder={PickerTexts.placeholder}
        onDropdownVisibleChange={setOpen}
        onChange={(next) => onChange?.(next ?? null)}
        options={categories.map((item) => ({ value: item.id, label: item.name }))}
        optionRender={(option) => (
          <div className="flex items-center justify-between gap-2">
            <span className="truncate">{option.label}</span>

            <Space size={0} onClick={(event) => event.stopPropagation()}>
              <Tooltip title="Переименовать">
                <Button
                  type="text"
                  size="small"
                  aria-label={`Переименовать категорию ${option.label}`}
                  icon={<EditOutlined />}
                  onClick={() => startRename(
                    categories.find((item) => item.id === option.value) as IShopCategory,
                  )}
                  className="cursor-pointer!"
                />
              </Tooltip>

              <Tooltip title="Удалить">
                <Button
                  type="text"
                  size="small"
                  danger
                  aria-label={`Удалить категорию ${option.label}`}
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(
                    categories.find((item) => item.id === option.value) as IShopCategory,
                  )}
                  className="cursor-pointer!"
                />
              </Tooltip>
            </Space>
          </div>
        )}
        dropdownRender={(menu) => (
          <>
            <Button
              type="text"
              block
              icon={<PlusOutlined />}
              onClick={startCreate}
              className="cursor-pointer! justify-start! font-medium! text-indigo-600!"
            >
              {PickerTexts.create}
            </Button>

            <Divider className="my-1!" />

            <If
              condition={categories.length > 0}
              fallback={<div className="px-3 py-2 text-sm text-slate-400">{PickerTexts.empty}</div>}
            >
              {menu}
            </If>
          </>
        )}
      />

      <Modal
        open={Boolean(draft)}
        title={draft?.id ? PickerTexts.renameTitle : PickerTexts.createTitle}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={isBusy}
        okButtonProps={{ disabled: !draft?.name.trim() }}
        onOk={handleSave}
        onCancel={closeDraft}
        destroyOnClose
      >
        <Input
          autoFocus
          value={draft?.name ?? ''}
          placeholder={PickerTexts.namePlaceholder}
          onChange={(event) => setDraft((current) => (
            current ? { ...current, name: event.target.value } : current
          ))}
          onPressEnter={handleSave}
        />
      </Modal>
    </>
  );
};
