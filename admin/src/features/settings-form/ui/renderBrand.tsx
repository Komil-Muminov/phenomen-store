import { Card, Form, Input, Typography } from 'antd';

const COLOR_FIELDS = [
  { key: 'primary', label: 'Основной' },
  { key: 'accent', label: 'Акцент' },
  { key: 'background', label: 'Фон' },
  { key: 'text', label: 'Текст' },
] as const;

export const RenderBrand = () => (
  <Card title="Бренд и оформление" className="mb-4!">
    <Form.Item name={['brand', 'title']} label="Название магазина">
      <Input placeholder="PHENOMEN Fashion" />
    </Form.Item>

    <Form.Item name={['brand', 'slogan']} label="Слоган">
      <Input placeholder="Одежда, которая работает на вас" />
    </Form.Item>

    <Form.Item name={['brand', 'logoUrl']} label="Ссылка на логотип">
      <Input placeholder="https://..." />
    </Form.Item>

    <Typography.Text strong className="mb-2! block text-brand-text!">
      Цвета приложения
    </Typography.Text>

    <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
      {COLOR_FIELDS.map((field) => (
        <Form.Item key={field.key} name={['theme', 'colors', field.key]} label={field.label}>
          <Input type="color" className="h-10! p-1!" />
        </Form.Item>
      ))}
    </div>
  </Card>
);
