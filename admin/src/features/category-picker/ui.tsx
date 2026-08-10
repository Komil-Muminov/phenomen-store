import { useCallback, useState } from 'react';
import { App as AntApp, Input, Modal, Select, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
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

const ACTION_BASE = 'flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-slate-400 opacity-70 transition-colors duration-200 focus-visible:opacity-100 group-hover:opacity-100';

const ACTION_EDIT = `${ACTION_BASE} hover:bg-indigo-50 hover:text-indigo-600`;

const ACTION_DELETE = `${ACTION_BASE} hover:bg-rose-50 hover:text-rose-600`;

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

  const findCategory = useCallback(
    (id: unknown) => categories.find((item) => item.id === id) as IShopCategory,
    [categories],
  );

  return (
    <>
      <Select
        allowClear
        showSearch
        open={open}
        value={value ?? undefined}
        optionFilterProp="label"
        placeholder={PickerTexts.placeholder}
        popupMatchSelectWidth={false}
        classNames={{ popup: { root: 'min-w-72! rounded-2xl! p-1.5! shadow-lg!' } }}
        onDropdownVisibleChange={setOpen}
        onChange={(next) => onChange?.(next ?? null)}
        options={categories.map((item) => ({ value: item.id, label: item.name }))}
        optionRender={(option) => (
          <div className="group flex items-center justify-between gap-2">
            <span className="truncate">{option.label}</span>

            <span
              className="flex shrink-0 items-center gap-0.5"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip title="Переименовать">
                <button
                  type="button"
                  aria-label={`Переименовать категорию ${option.label}`}
                  className={ACTION_EDIT}
                  onClick={() => startRename(findCategory(option.value))}
                >
                  <EditOutlined />
                </button>
              </Tooltip>

              <Tooltip title="Удалить">
                <button
                  type="button"
                  aria-label={`Удалить категорию ${option.label}`}
                  className={ACTION_DELETE}
                  onClick={() => handleDelete(findCategory(option.value))}
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </span>
          </div>
        )}
        dropdownRender={(menu) => (
          <>
            <button
              type="button"
              onClick={startCreate}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-2 py-2 text-left transition-colors duration-200 hover:bg-indigo-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <PlusOutlined />
              </span>
              <span className="text-sm font-semibold text-indigo-600">{PickerTexts.create}</span>
            </button>

            <If
              condition={categories.length > 0}
              fallback={(
                <div className="px-2 pb-2 pt-1">
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-4 text-center">
                    <FolderOpenOutlined className="text-lg text-slate-300" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-600">{PickerTexts.empty}</span>
                    <span className="px-4 text-xs text-slate-400">{PickerTexts.emptyHint}</span>
                  </div>
                </div>
              )}
            >
              <div className="my-1 border-t border-slate-200/70" />
              {menu}
            </If>
          </>
        )}
      />

      <Modal
        open={Boolean(draft)}
        width={440}
        title={draft?.id ? PickerTexts.renameTitle : PickerTexts.createTitle}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={isBusy}
        okButtonProps={{ disabled: !draft?.name.trim() }}
        onOk={handleSave}
        onCancel={closeDraft}
        destroyOnClose
      >
        <Typography.Text className="mb-1.5! block text-sm! font-medium! text-slate-700!">
          {PickerTexts.nameLabel}
        </Typography.Text>

        <Input
          autoFocus
          size="large"
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
