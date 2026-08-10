import { useEffect } from 'react';
import { Button, Form } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { RenderBrand } from '@/features/settings-form/ui/renderBrand';
import { RenderCommerce } from '@/features/settings-form/ui/renderCommerce';
import type { ITenantConfig, ITenantConfigPatch } from '@/entities/tenant-config';

interface IProps {
  config: ITenantConfig | null;
  isSaving: boolean;
  onSubmit: (patch: ITenantConfigPatch) => void;
}

export const SettingsForm = ({ config, isSaving, onSubmit }: IProps) => {
  const [form] = Form.useForm<ITenantConfigPatch>();

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        brand: config.brand,
        theme: { colors: config.theme?.colors ?? {} },
        orderRules: config.orderRules,
        delivery: config.delivery,
        payment: config.payment,
        contacts: config.contacts,
      });
    }
  }, [config, form]);

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false} disabled={isSaving}>
      <RenderBrand />
      <RenderCommerce />

      <div className="sticky bottom-6 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-md backdrop-blur-md">
        <div className="text-xs font-medium text-slate-500">
          Изменения автоматически синхронизируются с мобильным приложением
        </div>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<SaveOutlined />}
          loading={isSaving}
          className="cursor-pointer! bg-indigo-600! hover:bg-indigo-500! rounded-xl! font-semibold! px-6!"
        >
          Сохранить изменения
        </Button>
      </div>
    </Form>
  );
};
