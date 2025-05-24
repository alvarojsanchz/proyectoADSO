//app/configuracion/estacionamiento.tsx
import { API_BASE_URL } from '@/constants/api';
import { EstacionamientoInfo } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
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
import { styles } from '../../styles/configuracion.styles';

export default function EstacionamientoScreen() {
  const router = useRouter();
  const [estacionamiento, setEstacionamiento] = useState<EstacionamientoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [capacidad, setCapacidad] = useState('');

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

  // Función para cargar información del estacionamiento
  const loadEstacionamiento = useCallback(async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/estacionamiento/${userEmail}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data: EstacionamientoInfo = await response.json();
      setEstacionamiento(data);
      
      // Llenar formulario con datos actuales
      setNombre(data.nombre);
      setDireccion(data.direccion);
      setCiudad(data.ciudad || '');
      setCapacidad(data.capacidad.toString());
    } catch (error) {
      console.error('Error cargando estacionamiento:', error);
      Alert.alert('Error', 'No se pudo cargar la información del estacionamiento');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Cargar información cuando se obtiene el email
  useEffect(() => {
    loadEstacionamiento();
  }, [loadEstacionamiento]);

  const handleUpdateEstacionamiento = async () => {
    if (!nombre.trim() || !direccion.trim() || !capacidad.trim()) {
      Alert.alert('Error', 'Nombre, dirección y capacidad son obligatorios');
      return;
    }

    const capacidadNum = parseInt(capacidad);
    if (isNaN(capacidadNum) || capacidadNum <= 0 || capacidadNum > 999) {
      Alert.alert('Error', 'La capacidad debe ser un número entre 1 y 999');
      return;
    }

    // Verificar si se está reduciendo la capacidad
    if (estacionamiento && capacidadNum < estacionamiento.capacidad) {
      Alert.alert(
        'Confirmar cambio',
        `¿Está seguro de reducir la capacidad de ${estacionamiento.capacidad} a ${capacidadNum} espacios? Esto eliminará los espacios sobrantes.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: proceedWithUpdate }
        ]
      );
    } else {
      proceedWithUpdate();
    }
  };

  const proceedWithUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/estacionamiento/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          capacidad
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Información actualizada correctamente');
        loadEstacionamiento(); // Recargar información
      } else {
        Alert.alert('Error', data.error || 'Error al actualizar información');
      }
    } catch (error) {
      console.error('Error actualizando estacionamiento:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = () => {
    if (!estacionamiento) return false;
    return (
      nombre !== estacionamiento.nombre ||
      direccion !== estacionamiento.direccion ||
      ciudad !== (estacionamiento.ciudad || '') ||
      capacidad !== estacionamiento.capacidad.toString()
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Información del Estacionamiento</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Estadísticas actuales */}
        {estacionamiento && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Estado Actual</Text>
            <Text style={styles.infoCardText}>
              Espacios ocupados: {estacionamiento.estadisticas.espacios_ocupados} / {estacionamiento.capacidad}
              {'\n'}
              Espacios disponibles: {estacionamiento.estadisticas.espacios_disponibles}
            </Text>
          </View>
        )}

        {/* Formulario */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Nombre del Estacionamiento *</Text>
          <TextInput
            style={styles.formInput}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Estacionamiento Central"
            editable={!updating}
          />

          <Text style={styles.formLabel}>Dirección *</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Ej: Calle 123 #45-67"
            multiline
            numberOfLines={3}
            editable={!updating}
          />

          <Text style={styles.formLabel}>Ciudad</Text>
          <TextInput
            style={styles.formInput}
            value={ciudad}
            onChangeText={setCiudad}
            placeholder="Ej: Bucaramanga"
            editable={!updating}
          />

          <Text style={styles.formLabel}>Capacidad Total *</Text>
          <TextInput
            style={styles.formInput}
            value={capacidad}
            onChangeText={setCapacidad}
            placeholder="Número de espacios"
            keyboardType="numeric"
            editable={!updating}
          />
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges() || updating) && styles.saveButtonDisabled
          ]}
          onPress={handleUpdateEstacionamiento}
          disabled={!hasChanges() || updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasChanges() ? 'Guardar Cambios' : 'Sin Cambios'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Información Importante</Text>
          <Text style={styles.infoCardText}>
            • Al aumentar la capacidad se crearán nuevos espacios automáticamente
            {'\n'}
            • Al reducir la capacidad se eliminarán espacios, asegúrese de que no estén ocupados
            {'\n'}
            • Los cambios se aplicarán inmediatamente
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}