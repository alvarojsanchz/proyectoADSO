import { API_BASE_URL } from '@/constants/api';
import { styles } from '@/styles/registro.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../constants/theme';

type VehiculoActivo = {
  placa: string;
  fecha_hora_entrada: string;
  numero_espacio: string;
  tipo_vehiculo: string;
  tiempo_transcurrido: string;
};

export default function SalidaScreen() {
  const router = useRouter();
  const [placa, setPlaca] = useState('');
  const [vehiculosActivos, setVehiculosActivos] = useState<VehiculoActivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [selectedPlaca, setSelectedPlaca] = useState<string | null>(null);

  // Cargar datos del usuario logueado
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) {
          Alert.alert('Error', 'Sesión expirada');
          router.replace('/(auth)/login');
          return;
        }
        setUserEmail(email);
      } catch (error) {
        console.error('Error cargando datos usuario:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
    };

    loadUserData();
  }, [router]);

  // Función para cargar vehículos activos
  const loadVehiculosActivos = useCallback(async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehiculos-activos/${userEmail}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data: VehiculoActivo[] = await response.json();
      setVehiculosActivos(data);
    } catch (error) {
      console.error('Error cargando vehículos activos:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos activos');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Cargar vehículos activos cuando se obtiene el email
  useEffect(() => {
    loadVehiculosActivos();
  }, [loadVehiculosActivos]);

  const validarPlaca = (texto: string): boolean => {
    const placaLimpia = texto.replace(/\s/g, '').toUpperCase();
    return placaLimpia.length >= 6 && placaLimpia.length <= 8;
  };

  const buscarVehiculo = () => {
    if (!placa.trim()) {
      Alert.alert('Error', 'Por favor ingrese la placa del vehículo');
      return;
    }

    if (!validarPlaca(placa)) {
      Alert.alert('Error', 'La placa debe tener entre 6 y 8 caracteres');
      return;
    }

    const vehiculoEncontrado = vehiculosActivos.find(
      v => v.placa.toUpperCase() === placa.toUpperCase()
    );

    if (!vehiculoEncontrado) {
      Alert.alert('Error', 'No se encontró un vehículo activo con esa placa');
      return;
    }

    setSelectedPlaca(vehiculoEncontrado.placa);
  };

  const handleRegistrarSalida = async (placaVehiculo: string) => {
    setProcesando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/salida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: placaVehiculo.toUpperCase(),
          email: userEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Salida Registrada',
          `Placa: ${data.data.placa}\nTiempo: ${data.data.tiempo_estadia} hora(s)\nTotal: $${data.data.valor_total}\nEspacio liberado: ${data.data.espacio}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setPlaca('');
                setSelectedPlaca(null);
                loadVehiculosActivos();
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Error al registrar la salida');
      }
    } catch (error) {
      console.error('Error registrando salida:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setProcesando(false);
    }
  };

  const VehiculoCard = ({ vehiculo }: { vehiculo: VehiculoActivo }) => (
    <TouchableOpacity
      style={[
        styles.vehiculoCard,
        selectedPlaca === vehiculo.placa && styles.selectedVehiculoCard
      ]}
      onPress={() => setSelectedPlaca(vehiculo.placa)}
      disabled={procesando}
    >
      <View style={styles.vehiculoHeader}>
        <Text style={styles.vehiculoPlaca}>{vehiculo.placa}</Text>
        <Text style={styles.vehiculoTipo}>{vehiculo.tipo_vehiculo}</Text>
      </View>
      <View style={styles.vehiculoInfo}>
        <Text style={styles.vehiculoEspacio}>Espacio: {vehiculo.numero_espacio}</Text>
        <Text style={styles.vehiculoTiempo}>Tiempo: {vehiculo.tiempo_transcurrido}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.grey, marginTop: 10 }}>
          Cargando vehículos activos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.screenTitle}>Salida de vehículo</Text>

        <TextInput
          style={styles.placaInput}
          placeholder="Ingrese la placa"
          placeholderTextColor={COLORS.grey}
          value={placa}
          onChangeText={(text) => setPlaca(text.toUpperCase())}
          autoCapitalize="characters"
          maxLength={8}
          editable={!procesando}
        />

        <TouchableOpacity
          style={[styles.searchButton, (!placa || procesando) && styles.disabledButton]}
          disabled={!placa || procesando}
          onPress={buscarVehiculo}
        >
          <Text style={styles.buttonText}>Buscar Vehículo</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>
          Vehículos activos ({vehiculosActivos.length})
        </Text>

        {vehiculosActivos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay vehículos en el estacionamiento
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.vehiculosContainer}>
            {vehiculosActivos.map((vehiculo) => (
              <VehiculoCard key={vehiculo.placa} vehiculo={vehiculo} />
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedPlaca || procesando) && styles.disabledButton
          ]}
          disabled={!selectedPlaca || procesando}
          onPress={() => selectedPlaca && handleRegistrarSalida(selectedPlaca)}
        >
          {procesando ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="white" />
              <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                Procesando...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Registrar Salida</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={procesando}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}