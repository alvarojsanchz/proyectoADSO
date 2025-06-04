//app/informacion/historial.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/informacion.styles';

export default function HistorialScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Tickets</Text>
      </View>

      {/* Contenido placeholder */}
      <View style={styles.placeholderContainer}>
        <Ionicons name="receipt" size={80} color={COLORS.primary} />
        <Text style={styles.placeholderTitle}>Historial de Tickets</Text>
        <Text style={styles.placeholderText}>
          Esta sección mostrará:
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Lista de todos los tickets generados</Text>
          <Text style={styles.featureItem}>• Búsqueda por placa y fecha</Text>
          <Text style={styles.featureItem}>• Estado de tickets (activos/cerrados)</Text>
          <Text style={styles.featureItem}>• Detalles completos de cada ticket</Text>
        </View>
        <Text style={styles.comingSoon}>Próximamente disponible</Text>
      </View>
    </ScrollView>
  );
}