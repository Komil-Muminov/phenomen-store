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

      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<SaveOutlined />}
          loading={isSaving}
          className="cursor-pointer! transition-colors! duration-200!"
        >
          Сохранить настройки
        </Button>
      </div>
    </Form>
  );
};
