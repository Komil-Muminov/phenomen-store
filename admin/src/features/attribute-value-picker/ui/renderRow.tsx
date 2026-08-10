import { ReactNode } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { ValueTexts } from '@/features/attribute-value-picker/model';

const ACTION_BASE = 'flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-slate-400 opacity-70 transition-colors duration-200 focus-visible:opacity-100 group-hover:opacity-100';

const ACTION_EDIT = `${ACTION_BASE} hover:bg-indigo-50 hover:text-indigo-600`;

const ACTION_DELETE = `${ACTION_BASE} hover:bg-rose-50 hover:text-rose-600`;

interface IRowProps {
  item: string;
  onRename: (item: string) => void;
  onDelete: (item: string) => void;
}

export const RenderValueRow = ({ item, onRename, onDelete }: IRowProps) => (
  <div className="group flex items-center justify-between gap-2">
    <span className="truncate">{item}</span>

    <span
      className="flex shrink-0 items-center gap-0.5"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip title="Переименовать">
        <button
          type="button"
          aria-label={`Переименовать значение ${item}`}
          className={ACTION_EDIT}
          onClick={() => onRename(item)}
        >
          <EditOutlined />
        </button>
      </Tooltip>

      <Tooltip title="Удалить">
        <button
          type="button"
          aria-label={`Удалить значение ${item}`}
          className={ACTION_DELETE}
          onClick={() => onDelete(item)}
        >
          <DeleteOutlined />
        </button>
      </Tooltip>
    </span>
  </div>
);

interface IPopupProps {
  menu: ReactNode;
  hasValues: boolean;
  attributeLabel: string;
  onCreate: () => void;
  onCreateAttribute: () => void;
}

export const RenderPopup = ({
  menu,
  hasValues,
  attributeLabel,
  onCreate,
  onCreateAttribute,
}: IPopupProps) => (
  <>
    <div className="mb-1 flex flex-col gap-1 border-b border-slate-100 px-1 pb-1.5 pt-0.5">
      <button
        type="button"
        onClick={onCreate}
        className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-indigo-50/80 px-2.5 text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:bg-indigo-600 hover:text-white"
      >
        <PlusOutlined />
        {ValueTexts.create}
      </button>

      <button
        type="button"
        onClick={onCreateAttribute}
        className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
      >
        <PlusOutlined />
        {attributeLabel}
      </button>
    </div>

    <If
      condition={hasValues}
      fallback={(
        <div className="px-2 pb-1 pt-1">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-3 text-center">
            <TagsOutlined className="text-lg text-slate-300" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-600">{ValueTexts.empty}</span>
            <span className="px-4 text-xs text-slate-400">{ValueTexts.emptyHint}</span>
          </div>
        </div>
      )}
    >
      {menu}
    </If>
  </>
);
