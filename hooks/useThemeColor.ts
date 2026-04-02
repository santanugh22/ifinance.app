// hooks/useThemeColor.ts
import { Colors } from '@/constants/Colors';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Hook to get the current themed colors based on the user's preference.
 * Usage: const colors = useThemeColor();
 */
export function useThemeColor() {
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  return isDarkMode ? Colors.dark : Colors.light;
}
