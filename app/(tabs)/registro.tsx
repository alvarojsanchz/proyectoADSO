//app/(tabs)/registro.tsx
import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { REGISTRO_IMAGES } from '../../constants/registroImages';
import { styles } from '../../styles/registro.styles';

export default function RegistroScreen() {
  const router = useRouter();

  const CenteredCard = ({ 
    imageKey, 
    title, 
    onPress 
  }: { 
    imageKey: keyof typeof REGISTRO_IMAGES, 
    title: string,
    onPress: () => void 
  }) => (
    <TouchableOpacity
      style={styles.centeredCard}
      onPress={onPress}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={REGISTRO_IMAGES[imageKey]}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.registroContainer}>
      <Text style={styles.screenTitle}>Registro de Vehículos</Text>
      <CenteredCard
        imageKey="ingreso"
        title="Registrar Ingreso"
        onPress={() => router.push('/registro/ingreso')}
      />
      <CenteredCard
        imageKey="salida"
        title="Registrar Salida"
        onPress={() => router.push('/registro/salida')}
      />
    </ScrollView>
  );
}