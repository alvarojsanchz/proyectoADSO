//app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/dashboard.styles';

export default function Dashboard() {
  const [parkingName, setParkingName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userEmail');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) {
          router.replace('/(auth)/login');
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/user/${email}`);
        const data = await response.json();
        setParkingName(data.nombre || 'Mi Estacionamiento');
      } catch (error) {
        console.error('Error fetching parking data:', error);
        setParkingName('Mi Estacionamiento');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingData();
  }, [router]);

  const DashboardCard = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    color,
    bgColor 
  }: { 
    icon: string, 
    title: string, 
    description: string, 
    onPress: () => void,
    color: string,
    bgColor: string
  }) => (
    <TouchableOpacity style={styles.dashboardCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons 
            name={icon as any} 
            size={28} 
            color={color} 
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={COLORS.textMuted} 
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenido</Text>
          <Text style={styles.parkingName}>{parkingName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Título de sección */}
      <Text style={styles.sectionTitle}>Acciones Principales</Text>

      {/* Tarjetas principales */}
      <DashboardCard
        icon="car-sport"
        title="Registro de Vehículos"
        description="Registra el ingreso o salida de vehículos de forma rápida"
        onPress={() => router.push('/registro')}
        color={COLORS.primary}
        bgColor={COLORS.primary + '15'}
      />

      <DashboardCard
        icon="analytics"
        title="Información General"
        description="Consulta reportes de ocupación, contables y historial de tickets"
        onPress={() => router.push('/informacion')}
        color={COLORS.info}
        bgColor={COLORS.info + '15'}
      />

      <DashboardCard
        icon="settings"
        title="Configuración"
        description="Gestiona tarifas, información del estacionamiento y preferencias"
        onPress={() => router.push('/configuracion')}
        color={COLORS.textSecondary}
        bgColor={COLORS.textSecondary + '15'}
      />

      {/* Información adicional */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Gestiona tu estacionamiento de manera eficiente desde esta aplicación
          </Text>
        </View>
      </View>

      {/* Espaciado final */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}