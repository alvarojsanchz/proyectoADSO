import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { COLORS } from '../../constants/theme'
export default function TabsLayout() {
  return (
    <Tabs
        screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: COLORS.surface,
                borderTopWidth: 0,
                position: 'absolute',
                elevation: 0,
                height: 60,
                paddingTop: 10,
                paddingBottom: 20
            }
        }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ size, color}) => < Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="registro" options={{ tabBarIcon: ({ size, color}) => < Ionicons name="car-sport" size={size} color={color} /> }} />
      <Tabs.Screen name="informacion" options={{ tabBarIcon: ({ size, color}) => < Ionicons name="information-circle" size={size} color={color} /> }} />
      <Tabs.Screen name="configuracion" options={{ tabBarIcon: ({ size, color}) => < Ionicons name="settings" size={size} color={color} /> }} />
    </Tabs>
  )
}