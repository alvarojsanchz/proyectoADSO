//app/(tabs)/informacion.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/informacion.styles';

export default function InformacionScreen() {
  const router = useRouter();

  const InfoCard = ({ 
    icon, 
    title, 
    description, 
    route,
    color 
  }: { 
    icon: string, 
    title: string, 
    description: string, 
    route: string,
    color: string
  }) => (
    <TouchableOpacity 
      style={styles.infoCard} 
      onPress={() => router.push(route as any)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons 
            name={icon as any} 
            size={32} 
            color={color} 
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={COLORS.grey} 
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Información General</Text>
      
      <InfoCard
        icon="analytics"
        title="Reporte de Ocupación"
        description="Estado actual del estacionamiento, espacios ocupados y tiempo promedio de estadía"
        route="/informacion/ocupacion"
        color="#4ADE80"
      />

      <InfoCard
        icon="wallet"
        title="Reporte Contable"
        description="Ingresos diarios, semanales y mensuales con análisis por tipo de vehículo"
        route="/informacion/contable"
        color="#3B82F6"
      />

      <InfoCard
        icon="receipt"
        title="Historial de Tickets"
        description="Tickets generados, búsqueda por placa y seguimiento de estados"
        route="/informacion/historial"
        color="#F59E0B"
      />

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Accede a reportes detallados sobre el funcionamiento de tu estacionamiento
        </Text>
      </View>
    </ScrollView>
  );
}