//app/(tabs)/configuracion.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/configuracion.styles';

export default function ConfiguracionScreen() {
  const router = useRouter();

  const ConfigCard = ({ 
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
      style={styles.configCard} 
      onPress={() => router.push(route as any)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
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
          color={COLORS.grey} 
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      
      {/* Sección: Gestión del Estacionamiento */}
      <Text style={styles.sectionTitle}>Gestión del Estacionamiento</Text>
      
      <ConfigCard
        icon="cash"
        title="Gestión de Tarifas"
        description="Configurar precios por tipo de vehículo"
        route="/configuracion/tarifas"
        color="#4ADE80"
      />

      <ConfigCard
        icon="business"
        title="Información del Estacionamiento"
        description="Editar nombre, dirección y capacidad"
        route="/configuracion/estacionamiento"
        color="#3B82F6"
      />

      {/* Sección: Cuenta y Seguridad */}
      <Text style={styles.sectionTitle}>Cuenta y Seguridad</Text>

      <ConfigCard
        icon="key"
        title="Cambiar Contraseña"
        description="Actualizar contraseña de acceso"
        route="/configuracion/password"
        color="#F59E0B"
      />

      <ConfigCard
        icon="information-circle"
        title="Acerca de la App"
        description="Información de la aplicación y soporte"
        route="/configuracion/about"
        color="#8B5CF6"
      />

      {/* Información adicional */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Personaliza la configuración de tu estacionamiento desde aquí
        </Text>
      </View>
    </ScrollView>
  );
}