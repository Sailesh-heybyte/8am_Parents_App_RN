import { useWindowDimensions } from 'react-native';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function useTextScale() {
  const { width, fontScale } = useWindowDimensions();
  const widthScale = clamp(width / 400, 0.9, 1.15);
  return clamp(widthScale * fontScale, 0.9, 1.3);
}

