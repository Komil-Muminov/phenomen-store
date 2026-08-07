import { useCallback, useState } from 'react';
import { Button, Input, Typography, Upload, message } from 'antd';
import { DeleteOutlined, PictureOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { extractErrorMessage, uploadFile } from '@/shared/api';
import { ApiRoutes } from '@/shared/config';
import { Tooltip } from '@/shared/ui/Tooltip';
import { If } from '@/shared/ui/If';

interface IProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.gif';

export const RenderMedia = ({ urls, onChange }: IProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback((file: File) => {
    setUploading(true);

    uploadFile<{ url: string }>(ApiRoutes.shopMediaUpload, file)
      .then((result) => onChange([...urls, result.url]))
      .catch((error) => message.error(extractErrorMessage(error)))
      .finally(() => setUploading(false));

    return false;
  }, [urls, onChange]);

  return (
    <section className="mb-4 rounded-xl border border-violet-200 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Typography.Text strong className="text-brand-text!">
          Картинки
        </Typography.Text>

        <div className="flex items-center gap-2">
          <Upload accept={ACCEPTED} beforeUpload={handleUpload} showUploadList={false} maxCount={1}>
            <Button
              size="small"
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              className="cursor-pointer!"
            >
              Загрузить файл
            </Button>
          </Upload>

          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onChange([...urls, ''])}
            className="cursor-pointer!"
          >
            Ссылкой
          </Button>
        </div>
      </div>

      <If
        condition={urls.length > 0}
        fallback={(
          <Typography.Text type="secondary" className="text-sm!">
            Картинок нет — товар покажется в каталоге заглушкой
          </Typography.Text>
        )}
      >
        <div className="flex flex-col gap-2">
          {urls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-violet-50">
                <If
                  condition={Boolean(url)}
                  fallback={<PictureOutlined className="text-violet-300" aria-hidden="true" />}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </If>
              </span>

              <Input
                value={url}
                placeholder="https://..."
                onChange={(event) => onChange(
                  urls.map((item, position) => (position === index ? event.target.value : item)),
                )}
              />

              <Tooltip title="Удалить">
                <Button
                  type="text"
                  danger
                  aria-label="Удалить картинку"
                  icon={<DeleteOutlined />}
                  onClick={() => onChange(urls.filter((_item, position) => position !== index))}
                  className="cursor-pointer!"
                />
              </Tooltip>
            </div>
          ))}
        </div>

        <Typography.Text type="secondary" className="mt-2! block text-xs!">
          Первая картинка используется как основная в каталоге. Максимум 5 МБ на файл.
        </Typography.Text>
      </If>
    </section>
  );
};
