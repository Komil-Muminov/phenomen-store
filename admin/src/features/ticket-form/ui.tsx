import { useCallback } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { UiMessages } from '@/shared/config';
import { TicketTopicOptions } from '@/entities/ticket';
import {
  ITicketValues,
  TicketFormLimits,
  TicketFormTexts,
} from '@/features/ticket-form/model';

interface IProps {
  isOpen: boolean;
  isSaving: boolean;
  onSubmit: (values: ITicketValues) => void;
  onCancel: () => void;
}

const DEFAULT_TOPIC = 'other';

export const TicketForm = ({ isOpen, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<ITicketValues>();

  const handleOk = useCallback(() => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    }).catch(() => undefined);
  }, [form, onSubmit]);

  return (
    <Modal
      open={isOpen}
      title={TicketFormTexts.title}
      okText={TicketFormTexts.submit}
      cancelText={TicketFormTexts.cancel}
      confirmLoading={isSaving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ topic: DEFAULT_TOPIC }}
      >
        <Form.Item
          name="subject"
          label={TicketFormTexts.subject}
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input
            maxLength={TicketFormLimits.subjectMax}
            placeholder={TicketFormTexts.subjectPlaceholder}
          />
        </Form.Item>

        <Form.Item name="topic" label={TicketFormTexts.topic}>
          <Select options={TicketTopicOptions} />
        </Form.Item>

        <Form.Item
          name="text"
          label={TicketFormTexts.text}
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input.TextArea
            maxLength={TicketFormLimits.textMax}
            placeholder={TicketFormTexts.textPlaceholder}
            autoSize={{ minRows: 4, maxRows: 10 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
