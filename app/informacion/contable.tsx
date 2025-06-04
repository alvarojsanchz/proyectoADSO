//app/informacion/contable.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/informacion.styles';

export default function ContableScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reporte Contable</Text>
      </View>

      {/* Contenido placeholder */}
      <View style={styles.placeholderContainer}>
        <Ionicons name="wallet" size={80} color={COLORS.primary} />
        <Text style={styles.placeholderTitle}>Reporte Contable</Text>
        <Text style={styles.placeholderText}>
          Esta sección mostrará:
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Ingresos diarios, semanales y mensuales</Text>
          <Text style={styles.featureItem}>• Análisis por tipo de vehículo</Text>
          <Text style={styles.featureItem}>• Comparativas con períodos anteriores</Text>
          <Text style={styles.featureItem}>• Gráficos de tendencias</Text>
        </View>
        <Text style={styles.comingSoon}>Próximamente disponible</Text>
      </View>
    </ScrollView>
  );
}