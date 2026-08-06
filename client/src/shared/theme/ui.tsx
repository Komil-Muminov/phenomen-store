import { createContext, ReactNode, useContext, useMemo } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { ITenantConfig, IThemeTokens } from '@/entities/tenant';
import { buildThemeVars, normalizeTheme } from '@/shared/theme/lib';

interface IThemeContext {
  theme: IThemeTokens;
  config: ITenantConfig | null;
}

interface IProps {
  config: ITenantConfig | null;
  children: ReactNode;
}

const ThemeContext = createContext<IThemeContext>({ theme: normalizeTheme(null), config: null });

export const useTheme = (): IThemeContext => useContext(ThemeContext);

export const ThemeProvider = ({ config, children }: IProps) => {
  const theme = useMemo(() => normalizeTheme(config?.theme), [config?.theme]);
  const contextValue = useMemo(() => ({ theme, config }), [theme, config]);
  const style = useMemo(() => vars(buildThemeVars(theme)), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={style} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeContext.Provider>
  );
};
