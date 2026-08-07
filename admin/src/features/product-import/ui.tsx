import { useCallback, useState } from 'react';
import { Alert, Button, Modal, Table, Typography, Upload } from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import {
  buildTemplate,
  IImportResult,
  IImportRow,
  parseCsv,
} from '@/features/product-import/model';

interface IProps {
  open: boolean;
  isSaving: boolean;
  result: IImportResult | null;
  onSubmit: (rows: IImportRow[]) => void;
  onCancel: () => void;
}

const PREVIEW_LIMIT = 50;

export const ProductImport = ({ open, isSaving, result, onSubmit, onCancel }: IProps) => {
  const [rows, setRows] = useState<IImportRow[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ''));

      setRows(parsed.rows);
      setUnknown(parsed.unknown);
      setFileName(file.name);
    };

    reader.readAsText(file, 'utf-8');

    return false;
  }, []);

  const handleTemplate = useCallback(() => {
    const blob = new Blob([`﻿${buildTemplate()}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'shablon-tovarov.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Modal
      open={open}
      title="Загрузка товаров из таблицы"
      okText={`Загрузить ${rows.length || ''}`.trim()}
      cancelText="Закрыть"
      confirmLoading={isSaving}
      okButtonProps={{ disabled: rows.length === 0 }}
      onOk={() => onSubmit(rows)}
      onCancel={onCancel}
      width={860}
      destroyOnClose
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Typography.Text type="secondary">
          Файл CSV. Колонки: название, цена, категория, бренд, описание, единица, картинки.
        </Typography.Text>
        <Button icon={<DownloadOutlined />} onClick={handleTemplate} className="cursor-pointer!">
          Шаблон
        </Button>
      </div>

      <Upload.Dragger accept=".csv,text/csv" beforeUpload={handleFile} showUploadList={false} maxCount={1}>
        <p className="text-3xl text-violet-400">
          <InboxOutlined aria-hidden="true" />
        </p>
        <p className="text-sm">Перетащите файл сюда или нажмите для выбора</p>
        <If condition={Boolean(fileName)}>
          <p className="font-mono text-xs text-violet-600">{fileName}</p>
        </If>
      </Upload.Dragger>

      <If condition={unknown.length > 0}>
        <Alert
          type="warning"
          showIcon
          className="mt-4!"
          message={`Колонки не распознаны и будут пропущены: ${unknown.join(', ')}`}
        />
      </If>

      <If condition={rows.length > 0}>
        <div className="mt-4">
          <Typography.Text strong className="mb-2! block">
            Будет загружено строк: {rows.length}
          </Typography.Text>
          <Table<IImportRow>
            rowKey={(row) => `${row.name}-${row.price}`}
            size="small"
            pagination={false}
            scroll={{ y: 240 }}
            dataSource={rows.slice(0, PREVIEW_LIMIT)}
            columns={[
              { title: 'Название', dataIndex: 'name', key: 'name' },
              { title: 'Цена', dataIndex: 'price', key: 'price' },
              { title: 'Категория', dataIndex: 'category', key: 'category' },
              { title: 'Единица', dataIndex: 'unit', key: 'unit' },
            ]}
          />
        </div>
      </If>

      <If condition={Boolean(result)}>
        <Alert
          type={result && result.failed.length > 0 ? 'warning' : 'success'}
          showIcon
          className="mt-4!"
          message={`Создано: ${result?.created ?? 0}, обновлено: ${result?.updated ?? 0}, ошибок: ${result?.failed.length ?? 0}`}
          description={(result?.failed ?? []).slice(0, 5).map((item) => (
            <div key={item.row} className="text-xs">
              Строка {item.row} «{item.name}»: {item.reason}
            </div>
          ))}
        />
      </If>
    </Modal>
  );
};
