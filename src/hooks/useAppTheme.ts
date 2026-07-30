import { useColorScheme } from 'react-native';

import { AppTheme, darkTheme, lightTheme } from '@/src/constants/colors';
import { useThemePreference } from '@/src/providers/AppThemeProvider';

export function useAppTheme(): AppTheme {
  const systemColorScheme = useColorScheme();
  const { preference } = useThemePreference();
  const mode = preference === 'system' ? systemColorScheme ?? 'light' : preference;
  return mode === 'dark' ? darkTheme : lightTheme;
}
