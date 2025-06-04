//app/informacion/ocupacion.tsx
import { API_BASE_URL } from '@/constants/api';
import { ReporteOcupacion } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/informacion.styles';

export default function OcupacionScreen() {
  const router = useRouter();
  const [reporte, setReporte] = useState<ReporteOcupacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Cargar email del usuario
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) {
          Alert.alert('Error', 'Sesión expirada');
          router.replace('/(auth)/login');
          return;
        }
        setUserEmail(email);
      } catch (error) {
        console.error('Error cargando email:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
    };

    loadUserEmail();
  }, [router]);

  // Función para cargar reporte de ocupación
  const loadReporteOcupacion = useCallback(async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/reporte-ocupacion/${userEmail}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data: ReporteOcupacion = await response.json();
      setReporte(data);
    } catch (error) {
      console.error('Error cargando reporte:', error);
      Alert.alert('Error', 'No se pudo cargar el reporte de ocupación');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail]);

  // Cargar reporte cuando se obtiene el email
  useEffect(() => {
    loadReporteOcupacion();
  }, [loadReporteOcupacion]);

  // Función para refrescar
  const onRefresh = () => {
    setRefreshing(true);
    loadReporteOcupacion();
  };

  // Función para obtener color según estado
  const getColorByEstado = (estado: string) => {
    switch (estado) {
      case 'bajo': return COLORS.success;
      case 'medio': return COLORS.warning;
      case 'alto': return COLORS.error;
      case 'lleno': return '#DC2626';
      default: return COLORS.textMuted;
    }
  };

  // Función para obtener mensaje según estado
  const getMessageByEstado = (estado: string) => {
    switch (estado) {
      case 'bajo': return 'Ocupación baja';
      case 'medio': return 'Ocupación moderada';
      case 'alto': return 'Ocupación alta';
      case 'lleno': return 'Estacionamiento lleno';
      default: return 'Estado desconocido';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color 
  }: { 
    title: string, 
    value: string | number, 
    subtitle?: string, 
    icon: string, 
    color: string 
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando reporte de ocupación...</Text>
      </View>
    );
  }

  if (!reporte) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>No se pudo cargar el reporte</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReporteOcupacion}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reporte de Ocupación</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Información del estacionamiento */}
        <View style={[styles.infoCard, { marginHorizontal: 20, marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={[styles.cardTitle, { fontSize: 20, marginBottom: 4 }]}>
                {reporte.estacionamiento.nombre}
              </Text>
              <Text style={styles.cardDescription}>
                Capacidad: {reporte.estacionamiento.capacidad_total} espacios
              </Text>
            </View>
            <View style={{
              backgroundColor: getColorByEstado(reporte.ocupacion.estado) + '15',
              width: 80, 
              height: 60,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                color: getColorByEstado(reporte.ocupacion.estado),
                fontSize: 28,
                fontWeight: 'bold'
              }}>
                {reporte.ocupacion.porcentaje_ocupacion}%
              </Text>
              <Text style={{
                color: getColorByEstado(reporte.ocupacion.estado),
                fontSize: 10,
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {getMessageByEstado(reporte.ocupacion.estado)}
              </Text>
            </View>
          </View>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Espacios Ocupados"
            value={reporte.ocupacion.espacios_ocupados}
            subtitle={`de ${reporte.estacionamiento.capacidad_total} totales`}
            icon="car"
            color={COLORS.primary}
          />

          <StatCard
            title="Espacios Disponibles"
            value={reporte.ocupacion.espacios_disponibles}
            subtitle="espacios libres"
            icon="checkmark-circle"
            color={COLORS.success}
          />

          <StatCard
            title="Ingresos Hoy"
            value={reporte.actividad_dia.ingresos_hoy}
            subtitle="vehículos registrados"
            icon="trending-up"
            color={COLORS.info}
          />

          <StatCard
            title="Tiempo Promedio"
            value={`${reporte.vehiculos_activos.tiempo_promedio_estadia.horas}h ${reporte.vehiculos_activos.tiempo_promedio_estadia.minutos}m`}
            subtitle="estadía promedio"
            icon="time"
            color={COLORS.warning}
          />
        </View>

        {/* Vehículos por tipo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Vehículos Activos por Tipo ({reporte.vehiculos_activos.total})
          </Text>
          {reporte.vehiculos_activos.por_tipo.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No hay vehículos activos</Text>
            </View>
          ) : (
            reporte.vehiculos_activos.por_tipo.map((vehiculo, index) => (
              <View key={index} style={styles.vehicleTypeCard}>
                <View style={styles.vehicleTypeHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: COLORS.primary + '15',
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Ionicons 
                        name={vehiculo.tipo === 'Moto' ? 'bicycle' : 
                              vehiculo.tipo === 'Bus' ? 'bus' : 'car'} 
                        size={20} 
                        color={COLORS.primary} 
                      />
                    </View>
                    <View>
                      <Text style={styles.vehicleTypeName}>{vehiculo.tipo}</Text>
                      <Text style={styles.vehicleTypeTime}>
                        Promedio: {vehiculo.tiempo_promedio.horas}h {vehiculo.tiempo_promedio.minutos}m
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.vehicleTypeCount}>{vehiculo.cantidad}</Text>
                    <Text style={[styles.statSubtitle, { fontSize: 12 }]}>
                      {vehiculo.cantidad === 1 ? 'vehículo' : 'vehículos'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Información adicional */}
        <View style={[styles.infoSection, { marginHorizontal: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="refresh" size={16} color={COLORS.textMuted} />
            <Text style={[styles.infoText, { marginLeft: 8 }]}>
              Última actualización: {new Date(reporte.ultima_actualizacion).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}