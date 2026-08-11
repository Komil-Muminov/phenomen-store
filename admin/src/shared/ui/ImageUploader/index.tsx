import { useCallback, useState } from 'react';
import { Button, Image, Typography, Upload, message } from 'antd';
import { CloudUploadOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { extractErrorMessage, uploadFile } from '@/shared/api';
import { ApiRoutes, MediaAccept, MediaMaxSizeLabel } from '@/shared/config';
import { resolveMediaUrl } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';

interface IProps {
  value?: string;
  onChange?: (url: string) => void;
  title: string;
  hint: string;
  previewClass?: string;
}

const DEFAULT_PREVIEW = 'h-28 w-28';

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
    <section className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/60 p-5 transition-all hover:border-indigo-400 hover:bg-slate-50">
      <Typography.Text strong className="mb-3! block text-slate-800! font-semibold!">
        {title}
      </Typography.Text>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${previewClass}`}
        >
          <If
            condition={Boolean(value)}
            fallback={
              <div className="flex flex-col items-center justify-center text-slate-400">
                <PictureOutlined className="text-2xl" aria-hidden="true" />
              </div>
            }
          >
            <Image
              src={resolveMediaUrl(value)}
              alt={title}
              width="100%"
              height="100%"
              className="cursor-pointer! object-contain!"
              rootClassName="h-full w-full"
            />
          </If>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Upload
              accept={MediaAccept}
              beforeUpload={handleUpload}
              showUploadList={false}
              maxCount={1}
            >
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                loading={uploading}
                className="cursor-pointer! bg-indigo-600! hover:bg-indigo-500!"
              >
                {value ? 'Заменить изображение' : 'Загрузить файл'}
              </Button>
            </Upload>

            <If condition={Boolean(value)}>
              <Tooltip title="Удалить логотип">
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

          <Typography.Text className="mt-2.5! block text-xs! text-slate-500!">
            {`${hint} Форматы JPG, PNG, WebP, GIF, до ${MediaMaxSizeLabel}.`}
          </Typography.Text>
        </div>
      </div>
    </section>
  );
};
