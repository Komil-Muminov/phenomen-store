import { useCallback, useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Switch, Typography } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { BannerActionTypes, BannerDefaults, UiMessages } from '@/shared/config';
import { If } from '@/shared/ui/If';
import { RenderAction } from '@/features/banner-form/ui/renderAction';
import type { IShopBanner, IShopCategory, IShopProduct } from '@/entities/shop';

export interface IBannerFormValues {
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  actionType: string;
  actionValue: string | null;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

interface IFormState {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  actionType: string;
  actionValue?: string;
  position: number;
  showRange?: [Dayjs | null, Dayjs | null] | null;
  isActive: boolean;
}

interface IProps {
  open: boolean;
  editing: IShopBanner | null;
  categories: IShopCategory[];
  products: IShopProduct[];
  isSaving: boolean;
  onSubmit: (values: IBannerFormValues) => void;
  onCancel: () => void;
}

const URL_PLACEHOLDER = 'https://';

const toDayjs = (value: string | null): Dayjs | null => (value ? dayjs(value) : null);

export const BannerForm = ({
  open,
  editing,
  categories,
  products,
  isSaving,
  onSubmit,
  onCancel,
}: IProps) => {
  const [form] = Form.useForm<IFormState>();
  const imageUrl = Form.useWatch('imageUrl', form) ?? '';
  const actionType = Form.useWatch('actionType', form) ?? BannerActionTypes.none;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        imageUrl: editing?.imageUrl ?? '',
        title: editing?.title ?? '',
        subtitle: editing?.subtitle ?? '',
        actionType: editing?.actionType ?? BannerActionTypes.none,
        actionValue: editing?.actionValue ?? undefined,
        position: editing?.position ?? BannerDefaults.position,
        showRange: [toDayjs(editing?.startsAt ?? null), toDayjs(editing?.endsAt ?? null)],
        isActive: editing?.isActive ?? true,
      });
    }
  }, [open, editing, form]);

  const handleValuesChange = useCallback((changed: Partial<IFormState>) => {
    if (changed.actionType !== undefined) {
      form.setFieldValue('actionValue', undefined);
    }
  }, [form]);

  const handleFinish = useCallback((state: IFormState) => {
    const [startsAt, endsAt] = state.showRange ?? [null, null];

    onSubmit({
      imageUrl: state.imageUrl.trim(),
      title: state.title?.trim() ? state.title.trim() : null,
      subtitle: state.subtitle?.trim() ? state.subtitle.trim() : null,
      actionType: state.actionType,
      actionValue: state.actionValue?.trim() ? state.actionValue.trim() : null,
      position: state.position ?? BannerDefaults.position,
      startsAt: startsAt ? startsAt.startOf('day').toISOString() : null,
      endsAt: endsAt ? endsAt.endOf('day').toISOString() : null,
      isActive: state.isActive !== false,
    });
  }, [onSubmit]);

  return (
    <Modal
      open={open}
      width={620}
      title={editing ? 'Изменение баннера' : 'Новый баннер'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      >
        <section className="mb-4 flex items-start gap-3 rounded-xl border border-violet-200 p-4">
          <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-violet-50">
            <If
              condition={Boolean(imageUrl)}
              fallback={<PictureOutlined className="text-xl text-violet-300" aria-hidden="true" />}
            >
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </If>
          </span>

          <div className="min-w-0 flex-1">
            <Form.Item
              name="imageUrl"
              label="Ссылка на картинку"
              rules={[{ required: true, message: UiMessages.required }]}
              className="mb-1!"
            >
              <Input placeholder={URL_PLACEHOLDER} autoFocus />
            </Form.Item>

            <Typography.Text type="secondary" className="text-xs!">
              Прямая ссылка на файл, лучше по https и шириной от 1200px
            </Typography.Text>
          </div>
        </section>

        <Form.Item name="title" label="Заголовок">
          <Input placeholder="Новая коллекция" />
        </Form.Item>

        <Form.Item name="subtitle" label="Подзаголовок">
          <Input placeholder="Осень-зима уже в продаже" />
        </Form.Item>

        <RenderAction actionType={actionType} categories={categories} products={products} />

        <div className="flex flex-wrap items-start gap-4">
          <Form.Item
            name="showRange"
            label="Период показа"
            extra="Пусто — баннер показывается всегда"
            className="min-w-64 flex-1"
          >
            <DatePicker.RangePicker
              allowEmpty={[true, true]}
              format="DD.MM.YYYY"
              className="w-full!"
            />
          </Form.Item>

          <Form.Item
            name="position"
            label="Порядок"
            extra="Меньше число — левее в карусели"
            className="w-32"
          >
            <InputNumber min={0} step={BannerDefaults.positionStep} className="w-full!" />
          </Form.Item>

          <Form.Item name="isActive" label="Показывать" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
