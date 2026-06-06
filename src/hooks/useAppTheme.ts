import { useColorScheme } from 'react-native';

import { AppTheme, darkTheme, lightTheme } from '@/src/constants/colors';

export function useAppTheme(): AppTheme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
