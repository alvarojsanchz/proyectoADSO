//app/configuracion/password.tsx
import { API_BASE_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function PasswordScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Estados del formulario
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Estados de visibilidad
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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

  const handleChangePassword = async () => {
    // Validaciones
    if (!passwordActual.trim()) {
      Alert.alert('Error', 'Ingrese su contraseña actual');
      return;
    }

    if (!passwordNueva.trim()) {
      Alert.alert('Error', 'Ingrese la nueva contraseña');
      return;
    }

    if (passwordNueva.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordNueva !== passwordConfirm) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordActual === passwordNueva) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cambiar-password/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password_actual: passwordActual,
          password_nueva: passwordNueva
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Éxito', 
          'Contraseña actualizada correctamente',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar formulario
                setPasswordActual('');
                setPasswordNueva('');
                setPasswordConfirm('');
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setUpdating(false);
    }
  };

  const isFormValid = () => {
    return passwordActual.trim() && 
           passwordNueva.trim() && 
           passwordConfirm.trim() &&
           passwordNueva === passwordConfirm &&
           passwordNueva.length >= 6 &&
           passwordActual !== passwordNueva;
  };

  const PasswordInput = ({ 
    label, 
    value, 
    onChangeText, 
    showPassword, 
    onToggleShow, 
    placeholder 
  }: {
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    onToggleShow: () => void,
    placeholder: string
  }) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.currencyInput}>
        <TextInput
          style={[styles.currencyInputField, { paddingRight: 50 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          editable={!updating}
        />
        <TouchableOpacity
          onPress={onToggleShow}
          style={{ position: 'absolute', right: 15, padding: 5 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.grey}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información de seguridad */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Seguridad de la Cuenta</Text>
          <Text style={styles.infoCardText}>
            Por su seguridad, cambie su contraseña regularmente y use una contraseña fuerte 
            que incluya letras, números y caracteres especiales.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formSection}>
          <PasswordInput
            label="Contraseña Actual *"
            value={passwordActual}
            onChangeText={setPasswordActual}
            showPassword={showPasswordActual}
            onToggleShow={() => setShowPasswordActual(!showPasswordActual)}
            placeholder="Ingrese su contraseña actual"
          />

          <PasswordInput
            label="Nueva Contraseña *"
            value={passwordNueva}
            onChangeText={setPasswordNueva}
            showPassword={showPasswordNueva}
            onToggleShow={() => setShowPasswordNueva(!showPasswordNueva)}
            placeholder="Mínimo 6 caracteres"
          />

          <PasswordInput
            label="Confirmar Nueva Contraseña *"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            showPassword={showPasswordConfirm}
            onToggleShow={() => setShowPasswordConfirm(!showPasswordConfirm)}
            placeholder="Repita la nueva contraseña"
          />
        </View>

        {/* Indicadores de validación */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Requisitos de la Contraseña</Text>
          <View style={{ paddingLeft: 10 }}>
            <Text style={[
              styles.infoCardText, 
              { color: passwordNueva.length >= 6 ? COLORS.primary : COLORS.grey }
            ]}>
              ✓ Mínimo 6 caracteres
            </Text>
            <Text style={[
              styles.infoCardText, 
              { color: passwordNueva === passwordConfirm && passwordNueva ? COLORS.primary : COLORS.grey }
            ]}>
              ✓ Las contraseñas coinciden
            </Text>
            <Text style={[
              styles.infoCardText, 
              { color: passwordActual !== passwordNueva && passwordNueva ? COLORS.primary : COLORS.grey }
            ]}>
              ✓ Diferente a la contraseña actual
            </Text>
          </View>
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid() || updating) && styles.saveButtonDisabled
          ]}
          onPress={handleChangePassword}
          disabled={!isFormValid() || updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Cambiar Contraseña</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}