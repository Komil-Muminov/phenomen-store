import { ReactNode } from 'react';

interface IProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const If = ({ condition, children, fallback = null }: IProps) => (
  <>{condition ? children : fallback}</>
);
