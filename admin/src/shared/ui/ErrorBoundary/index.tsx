import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface IProps {
  children: ReactNode;
}

interface IState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<IProps, IState> {
  public state: IState = { hasError: false };

  public static getDerivedStateFromError(): IState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[admin-error]', error, info.componentStack);
  }

  public render(): ReactNode {
    return this.state.hasError ? (
      <Result
        status="error"
        title="Что-то пошло не так"
        subTitle="Попробуйте перезагрузить страницу"
        extra={(
          <Button type="primary" onClick={() => window.location.reload()} className="cursor-pointer!">
            Перезагрузить
          </Button>
        )}
      />
    ) : (
      this.props.children
    );
  }
}
