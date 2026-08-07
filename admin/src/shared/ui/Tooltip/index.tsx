import { ReactNode } from 'react';
import { Tooltip as AntTooltip } from 'antd';

interface IProps {
  title: string;
  children: ReactNode;
}

export const Tooltip = ({ title, children }: IProps) => (
  <AntTooltip title={title} mouseEnterDelay={0.2}>
    {children}
  </AntTooltip>
);
