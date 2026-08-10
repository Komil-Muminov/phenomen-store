import { Card, Form, Input, Typography } from 'antd';
import { BgColorsOutlined, ShopOutlined } from '@ant-design/icons';
import { ImageUploader } from '@/shared/ui/ImageUploader';

const COLOR_FIELDS = [
  { key: 'primary', label: 'Основной', defaultVal: '#6366f1' },
  { key: 'accent', label: 'Акцент', defaultVal: '#f97316' },
  { key: 'background', label: 'Фон', defaultVal: '#ffffff' },
  { key: 'text', label: 'Текст', defaultVal: '#0f172a' },
] as const;

interface IColorPickerProps {
  value?: string;
  onChange?: (val: string) => void;
}

const ColorSwatchInput = ({ value, onChange }: IColorPickerProps) => {
  const hexValue = value || '#6366f1';

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 transition-all hover:border-indigo-300 hover:bg-slate-50">
      <label className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-300/80 shadow-xs">
        <input
          type="color"
          value={hexValue.startsWith('#') ? hexValue : '#6366f1'}
          onChange={(e) => onChange?.(e.target.value)}
          className="absolute inset-0 h-12 w-12 cursor-pointer opacity-0"
        />
        <span className="h-full w-full rounded-md shadow-inner" style={{ backgroundColor: hexValue }} />
      </label>
      <Input
        value={hexValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="#6366F1"
        className="font-mono text-xs uppercase border-none bg-transparent! focus:bg-white!"
        maxLength={7}
      />
    </div>
  );
};

export const RenderBrand = () => (
  <Card
    title={(
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <ShopOutlined className="text-indigo-600" />
        <span>Бренд и оформление</span>
      </div>
    )}
    className="mb-6! border-slate-200/80 shadow-xs"
  >
    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      <Form.Item name={['brand', 'title']} label="Название магазина">
        <Input placeholder="PHENOMEN Fashion" className="rounded-xl!" />
      </Form.Item>

      <Form.Item name={['brand', 'slogan']} label="Слоган">
        <Input placeholder="Одежда, которая работает на вас" className="rounded-xl!" />
      </Form.Item>
    </div>

    <Form.Item name={['brand', 'logoUrl']} className="mb-6!">
      <ImageUploader
        title="Логотип магазина"
        hint="Квадратное или прямоугольное изображение на прозрачном или белом фоне (от 512px)."
        previewClass="h-24 w-24"
      />
    </Form.Item>

    <div className="mt-4 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center gap-2">
        <BgColorsOutlined className="text-indigo-600" />
        <Typography.Text strong className="text-slate-800!">
          Цвета мобильного приложения
        </Typography.Text>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {COLOR_FIELDS.map((field) => (
          <Form.Item key={field.key} name={['theme', 'colors', field.key]} label={field.label} className="mb-0!">
            <ColorSwatchInput />
          </Form.Item>
        ))}
      </div>
    </div>
  </Card>
);
