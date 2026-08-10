import { Card, Form, Input, InputNumber, Select, Switch } from 'antd';
import { CarOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { DeliveryMethods, PaymentMethods } from '@/shared/config';

export const RenderCommerce = () => (
  <>
    <Card
      title={(
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <CarOutlined className="text-indigo-600" />
          <span>Заказы и доставка</span>
        </div>
      )}
      className="mb-6! border-slate-200/80 shadow-xs"
    >
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <Form.Item
          name={['orderRules', 'minOrderTotal']}
          label="Минимальная сумма заказа"
          extra="0 — без ограничений"
        >
          <InputNumber min={0} step={50} addonAfter="сом." className="w-full!" />
        </Form.Item>

        <Form.Item
          name={['orderRules', 'guestCheckout']}
          label="Заказ без регистрации"
          valuePropName="checked"
        >
          <div className="flex items-center gap-3 pt-1">
            <Switch />
            <span className="text-xs text-slate-500">Разрешить пользователям оформлять быструю покупку без авторизации</span>
          </div>
        </Form.Item>
      </div>

      <Form.Item name={['delivery', 'methods']} label="Способы доставки">
        <Select
          mode="multiple"
          placeholder="Выберите варианты"
          options={DeliveryMethods.map((item) => ({ ...item }))}
          className="w-full!"
        />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <Form.Item name={['delivery', 'basePrice']} label="Стоимость доставки по умолчанию">
          <InputNumber min={0} step={10} addonAfter="сом." className="w-full!" />
        </Form.Item>

        <Form.Item
          name={['delivery', 'freeFrom']}
          label="Бесплатная доставка от суммы"
          extra="Оставьте пустым, если бесплатная доставка отсутствует"
        >
          <InputNumber min={0} step={50} addonAfter="сом." className="w-full!" />
        </Form.Item>
      </div>

      <Form.Item name={['payment', 'methods']} label="Способы оплаты">
        <Select
          mode="multiple"
          placeholder="Выберите методы оплаты"
          options={PaymentMethods.map((item) => ({ ...item }))}
          className="w-full!"
        />
      </Form.Item>
    </Card>

    <Card
      title={(
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <PhoneOutlined className="text-indigo-600" />
          <span>Контакты для поддержки</span>
        </div>
      )}
      className="mb-6! border-slate-200/80 shadow-xs"
    >
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <Form.Item name={['contacts', 'phone']} label="Телефон поддержки">
          <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="+992 900 00 00 00" />
        </Form.Item>

        <Form.Item name={['contacts', 'email']} label="Email службы заботы">
          <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="support@shop.ru" />
        </Form.Item>
      </div>
    </Card>
  </>
);
