import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          position: 'absolute',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingTop: 10,
          paddingBottom: 20
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          tabBarIcon: ({ size, color }) => 
            <Ionicons name="home" size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="registro" 
        options={{ 
          tabBarIcon: ({ size, color }) => 
            <Ionicons name="car-sport" size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="informacion" 
        options={{ 
          tabBarIcon: ({ size, color }) => 
            <Ionicons name="analytics" size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="configuracion" 
        options={{ 
          tabBarIcon: ({ size, color }) => 
            <Ionicons name="settings" size={size} color={color} /> 
        }} 
      />
    </Tabs>
  )
}