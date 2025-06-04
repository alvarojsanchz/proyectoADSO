//app/registro/ingreso.tsx
import { API_BASE_URL } from '@/constants/api';
import { styles } from '@/styles/registro.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { VEHICLE_IMAGES } from '../../constants/vehicleImages';

type TipoVehiculo = {
    id_tipo_vehiculo: number;
    nombre: string;
};

export default function IngresoScreen() {
    const router = useRouter();
    const [placa, setPlaca] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([]);
    const [loading, setLoading] = useState(true);
    const [registrando, setRegistrando] = useState(false);
    const [userEmail, setUserEmail] = useState('');

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

    // Función para cargar tipos de vehículo
    const loadTiposVehiculo = useCallback(async () => {
        if (!userEmail) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/tipos-vehiculo`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            const data: TipoVehiculo[] = await response.json();
            setTiposVehiculo(data);
        } catch (error) {
            console.error('Error cargando tipos de vehículo:', error);
            Alert.alert('Error', 'No se pudieron cargar los tipos de vehículo');
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    // Cargar tipos de vehículo cuando se obtiene el email
    useEffect(() => {
        loadTiposVehiculo();
    }, [loadTiposVehiculo]);

    const validarPlaca = (texto: string): boolean => {
        // Validación básica de placa colombiana
        const placaLimpia = texto.replace(/\s/g, '').toUpperCase();
        return placaLimpia.length >= 6 && placaLimpia.length <= 8;
    };

    const handleRegistrarIngreso = async () => {
        // Validaciones
        if (!placa.trim()) {
            Alert.alert('Error', 'Por favor ingrese la placa del vehículo');
            return;
        }

        if (!validarPlaca(placa)) {
            Alert.alert('Error', 'La placa debe tener entre 6 y 8 caracteres');
            return;
        }

        if (!selectedTypeId) {
            Alert.alert('Error', 'Por favor seleccione el tipo de vehículo');
            return;
        }

        setRegistrando(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingreso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    placa: placa.trim().toUpperCase(),
                    id_tipo_vehiculo: selectedTypeId,
                    email: userEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Éxito',
                    `Vehículo registrado exitosamente\nPlaca: ${data.data.placa}\nEspacio: ${data.data.espacio}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Limpiar formulario
                                setPlaca('');
                                setSelectedTypeId(null);
                                // Volver al dashboard
                                router.replace('/(tabs)');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', data.error || 'Error al registrar el vehículo');
            }
        } catch (error) {
            console.error('Error registrando ingreso:', error);
            Alert.alert('Error', 'No se pudo conectar al servidor');
        } finally {
            setRegistrando(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ color: COLORS.grey, marginTop: 10 }}>
                    Cargando tipos de vehículo...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.screenTitle}>Ingreso de vehículo</Text>
                
                <TextInput
                    style={styles.placaInput}
                    placeholder="Ingrese la placa"
                    placeholderTextColor={COLORS.grey}
                    value={placa}
                    onChangeText={(text) => setPlaca(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={8}
                    editable={!registrando}
                />

                <Text style={styles.subtitle}>Seleccione el tipo de vehículo</Text>
                
                {tiposVehiculo.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No se encontraron tipos de vehículo
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.typesContainer}
                    >
                        {tiposVehiculo.map((tipo) => (
                            <TouchableOpacity
                                key={tipo.id_tipo_vehiculo}
                                style={[
                                    styles.typeCard,
                                    selectedTypeId === tipo.id_tipo_vehiculo && styles.selectedCard
                                ]}
                                onPress={() => setSelectedTypeId(tipo.id_tipo_vehiculo)}
                                disabled={registrando}
                            >
                                <Image
                                    source={VEHICLE_IMAGES[tipo.nombre as keyof typeof VEHICLE_IMAGES]}
                                    style={styles.vehicleImage}
                                    onError={() => console.log('Error cargando imagen:', tipo.nombre)}
                                />
                                <Text style={[
                                    styles.typeText,
                                    selectedTypeId === tipo.id_tipo_vehiculo && styles.selectedText
                                ]}>
                                    {tipo.nombre}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </ScrollView>

            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (!placa || !selectedTypeId || registrando) && styles.disabledButton
                    ]}
                    disabled={!placa || !selectedTypeId || registrando}
                    onPress={handleRegistrarIngreso}
                >
                    {registrando ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                                Registrando...
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Registrar Ingreso</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={registrando}
                >
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}