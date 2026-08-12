import { Button, Empty, Spin, Tag, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { EntityStatuses, StaffRoleLabels, StaffRoles, UiMessages } from '@/shared/config';
import { Tooltip } from '@/shared/ui/Tooltip';
import { If } from '@/shared/ui/If';
import { CardTitles, ITenantCardHandlers } from '@/features/tenant-card/model';
import type { ITenantStaff } from '@/entities/tenant';

interface IProps {
  staff: ITenantStaff[];
  isLoading: boolean;
  onEditStaff: ITenantCardHandlers['onEditStaff'];
}

const formatContacts = (member: ITenantStaff): string => (
  [member.email, member.phone].filter(Boolean).join(' · ') || 'контакты не указаны'
);

export const RenderStaff = ({
  staff,
  isLoading,
  onEditStaff,
}: IProps) => (
  <section className="mb-6 rounded-xl border border-violet-200 p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <Typography.Text strong className="text-brand-text!">
        {CardTitles.staff}
      </Typography.Text>

    </div>

    <If
      condition={!isLoading}
      fallback={(
        <div className="flex justify-center py-6">
          <Spin />
        </div>
      )}
    >
      <If
        condition={staff.length > 0}
        fallback={<Empty description={UiMessages.emptyStaff} />}
      >
        <ul className="flex flex-col gap-2">
          {staff.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2 transition-colors duration-200 hover:border-violet-300"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member.name ?? 'без имени'}</span>
                  <Tag color={member.role === StaffRoles.owner ? 'purple' : 'default'}>
                    {StaffRoleLabels[member.role] ?? member.role}
                  </Tag>
                  <If condition={member.status !== EntityStatuses.active}>
                    <Tag color="red">доступ отключён</Tag>
                  </If>
                </div>
                <div className="truncate font-mono text-xs text-slate-500">
                  {formatContacts(member)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Tooltip title="Изменить данные и пароль">
                  <Button
                    type="text"
                    aria-label="Изменить сотрудника"
                    icon={<EditOutlined />}
                    onClick={() => onEditStaff(member)}
                    className="cursor-pointer!"
                  />
                </Tooltip>

              </div>
            </li>
          ))}
        </ul>
      </If>
    </If>
  </section>
);
