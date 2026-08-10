import { useCallback, useState } from 'react';
import { Button, Image, Typography, Upload, message } from 'antd';
import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { extractErrorMessage, uploadFile } from '@/shared/api';
import { ApiRoutes, MediaAccept, MediaMaxSizeLabel } from '@/shared/config';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';

interface IProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export const RenderImage = ({ imageUrl, onChange }: IProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback((file: File) => {
    setUploading(true);

    uploadFile<{ url: string }>(ApiRoutes.shopMediaUpload, file)
      .then((result) => onChange(result.url))
      .catch((error) => message.error(extractErrorMessage(error)))
      .finally(() => setUploading(false));

    return false;
  }, [onChange]);

  return (
    <section className="mb-4 rounded-xl border border-violet-200 p-4">
      <Typography.Text strong className="mb-3! block text-brand-text!">
        Картинка баннера
      </Typography.Text>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <span className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-violet-50 sm:w-44">
          <If
            condition={Boolean(imageUrl)}
            fallback={<PictureOutlined className="text-2xl text-violet-300" aria-hidden="true" />}
          >
            <Image
              src={imageUrl}
              alt="Загруженная картинка баннера"
              width="100%"
              height="100%"
              className="object-cover!"
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
                {imageUrl ? 'Заменить файл' : 'Выбрать файл'}
              </Button>
            </Upload>

            <If condition={Boolean(imageUrl)}>
              <Tooltip title="Убрать картинку">
                <Button
                  danger
                  aria-label="Убрать картинку баннера"
                  icon={<DeleteOutlined />}
                  onClick={() => onChange('')}
                  className="cursor-pointer!"
                />
              </Tooltip>
            </If>
          </div>

          <Typography.Text type="secondary" className="mt-2! block text-xs!">
            {`JPG, PNG, WebP или GIF, до ${MediaMaxSizeLabel}. Лучше горизонтальная картинка шириной от 1200px — она растянется на всю ширину карусели.`}
          </Typography.Text>
        </div>
      </div>
    </section>
  );
};
