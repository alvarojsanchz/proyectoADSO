import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background
        }
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}