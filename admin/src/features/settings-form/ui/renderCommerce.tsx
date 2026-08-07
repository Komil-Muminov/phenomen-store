import { Card, Form, Input, InputNumber, Select, Switch } from 'antd';
import { DeliveryMethods, PaymentMethods } from '@/shared/config';

export const RenderCommerce = () => (
  <>
    <Card title="Заказы и доставка" className="mb-4!">
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item
          name={['orderRules', 'minOrderTotal']}
          label="Минимальная сумма заказа"
          extra="0 — без ограничения"
        >
          <InputNumber min={0} step={50} className="w-full!" />
        </Form.Item>

        <Form.Item name={['orderRules', 'guestCheckout']} label="Заказ без регистрации" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>

      <Form.Item name={['delivery', 'methods']} label="Способы доставки">
        <Select mode="multiple" options={DeliveryMethods.map((item) => ({ ...item }))} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item name={['delivery', 'basePrice']} label="Стоимость доставки">
          <InputNumber min={0} step={10} className="w-full!" />
        </Form.Item>

        <Form.Item
          name={['delivery', 'freeFrom']}
          label="Бесплатно от суммы"
          extra="Пусто — бесплатной доставки нет"
        >
          <InputNumber min={0} step={50} className="w-full!" />
        </Form.Item>
      </div>

      <Form.Item name={['payment', 'methods']} label="Способы оплаты">
        <Select mode="multiple" options={PaymentMethods.map((item) => ({ ...item }))} />
      </Form.Item>
    </Card>

    <Card title="Контакты">
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item name={['contacts', 'phone']} label="Телефон">
          <Input placeholder="+992 900 00 00 00" />
        </Form.Item>

        <Form.Item name={['contacts', 'email']} label="Email">
          <Input placeholder="support@shop.ru" />
        </Form.Item>
      </div>
    </Card>
  </>
);
