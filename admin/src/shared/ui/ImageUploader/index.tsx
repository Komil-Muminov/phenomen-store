import { useCallback, useState } from 'react';
import { Button, Image, Typography, Upload, message } from 'antd';
import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { extractErrorMessage, uploadFile } from '@/shared/api';
import { ApiRoutes, MediaAccept, MediaMaxSizeLabel } from '@/shared/config';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';

interface IProps {
  value?: string;
  onChange?: (url: string) => void;
  title: string;
  hint: string;
  previewClass?: string;
}

const DEFAULT_PREVIEW = 'h-28 w-full sm:w-44';

export const ImageUploader = ({
  value = '',
  onChange,
  title,
  hint,
  previewClass = DEFAULT_PREVIEW,
}: IProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback((file: File) => {
    setUploading(true);

    uploadFile<{ url: string }>(ApiRoutes.shopMediaUpload, file)
      .then((result) => onChange?.(result.url))
      .catch((error) => message.error(extractErrorMessage(error)))
      .finally(() => setUploading(false));

    return false;
  }, [onChange]);

  return (
    <section className="rounded-xl border border-violet-200 p-4">
      <Typography.Text strong className="mb-3! block text-brand-text!">
        {title}
      </Typography.Text>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <span
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-violet-50 ${previewClass}`}
        >
          <If
            condition={Boolean(value)}
            fallback={<PictureOutlined className="text-2xl text-violet-300" aria-hidden="true" />}
          >
            <Image
              src={value}
              alt={title}
              width="100%"
              height="100%"
              className="cursor-pointer! object-contain!"
              rootClassName="h-full w-full"
            />
          </If>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Upload
              accept={MediaAccept}
              beforeUpload={handleUpload}
              showUploadList={false}
              maxCount={1}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={uploading}
                className="cursor-pointer!"
              >
                {value ? 'Заменить файл' : 'Выбрать файл'}
              </Button>
            </Upload>

            <If condition={Boolean(value)}>
              <Tooltip title="Убрать">
                <Button
                  danger
                  aria-label={`Убрать: ${title}`}
                  icon={<DeleteOutlined />}
                  onClick={() => onChange?.('')}
                  className="cursor-pointer!"
                />
              </Tooltip>
            </If>
          </div>

          <Typography.Text type="secondary" className="mt-2! block text-xs!">
            {`${hint} Форматы JPG, PNG, WebP, GIF, до ${MediaMaxSizeLabel}.`}
          </Typography.Text>
        </div>
      </div>
    </section>
  );
};
