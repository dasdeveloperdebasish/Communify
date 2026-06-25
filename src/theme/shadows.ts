import { Platform, ViewStyle } from 'react-native';

const shadow = (
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number
): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
  }),
});

export const shadows = {
  sm: shadow(1, 0.05, 2, 1),
  md: shadow(2, 0.08, 8, 3),
  lg: shadow(4, 0.12, 16, 6),
};
