//app/configuracion/tarifas.tsx
import { API_BASE_URL } from '@/constants/api';
import { Tarifa } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/configuracion.styles';

export default function TarifasScreen() {
  const router = useRouter();
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoValor, setNuevoValor] = useState('');
  const [updating, setUpdating] = useState(false);

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

  // Cargar tarifas
  const loadTarifas = useCallback(async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tarifas/${userEmail}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data: Tarifa[] = await response.json();
      setTarifas(data);
    } catch (error) {
      console.error('Error cargando tarifas:', error);
      Alert.alert('Error', 'No se pudieron cargar las tarifas');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Cargar tarifas cuando se obtiene el email
  useEffect(() => {
    loadTarifas();
  }, [loadTarifas]);

  const handleEditTarifa = (tarifa: Tarifa) => {
    setEditingTarifa(tarifa);
    setNuevoValor(tarifa.valor.toString());
    setModalVisible(true);
  };

  const handleUpdateTarifa = async () => {
    if (!editingTarifa || !nuevoValor.trim()) return;

    const valor = parseFloat(nuevoValor);
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Error', 'Ingrese un valor válido mayor a 0');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tarifas/${editingTarifa.id_tarifa}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Tarifa actualizada correctamente');
        setModalVisible(false);
        setEditingTarifa(null);
        setNuevoValor('');
        loadTarifas();
      } else {
        Alert.alert('Error', data.error || 'Error al actualizar tarifa');
      }
    } catch (error) {
      console.error('Error actualizando tarifa:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const TarifaCard = ({ tarifa }: { tarifa: Tarifa }) => (
    <View style={styles.tarifaCard}>
      <View style={styles.tarifaInfo}>
        <Text style={styles.tarifaTitle}>{tarifa.tipo_vehiculo}</Text>
        <Text style={styles.tarifaValue}>{formatCurrency(tarifa.valor)}/hora</Text>
      </View>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => handleEditTarifa(tarifa)}
      >
        <Ionicons name="create" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tarifas...</Text>
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
        <Text style={styles.headerTitle}>Gestión de Tarifas</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Configuración de Tarifas</Text>
          <Text style={styles.infoCardText}>
            Ajusta los precios por hora para cada tipo de vehículo. Los cambios se aplicarán 
            a los nuevos ingresos de vehículos.
          </Text>
        </View>

        {/* Lista de tarifas */}
        {tarifas.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No hay tarifas configuradas</Text>
          </View>
        ) : (
          tarifas.map((tarifa) => (
            <TarifaCard key={tarifa.id_tarifa} tarifa={tarifa} />
          ))
        )}
      </ScrollView>

      {/* Modal de edición */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Editar Tarifa - {editingTarifa?.tipo_vehiculo}
            </Text>
            
            <Text style={styles.formLabel}>Nuevo valor por hora:</Text>
            <View style={styles.currencyInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.currencyInputField}
                value={nuevoValor}
                onChangeText={setNuevoValor}
                placeholder="0"
                keyboardType="numeric"
                editable={!updating}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingTarifa(null);
                  setNuevoValor('');
                }}
                disabled={updating}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleUpdateTarifa}
                disabled={updating || !nuevoValor.trim()}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
