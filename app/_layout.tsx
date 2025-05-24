// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="registro/ingreso"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="registro/salida"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="informacion/ocupacion"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="informacion/contable"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="informacion/historial"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="configuracion/tarifas"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="configuracion/estacionamiento"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="configuracion/password"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="configuracion/about"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}