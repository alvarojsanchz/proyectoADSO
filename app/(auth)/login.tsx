//app/(auth)/login.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, Modal, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/auth.styles';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    capacidad: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido');
      }
  
      await AsyncStorage.setItem('userEmail', email);
      router.replace('/(tabs)');
      
    } catch (error) {
      Alert.alert(
        'Error de autenticación', 
        (error as Error).message || 'No se pudo conectar al servidor'
      );
      console.error('Detalles del error:', error);
    }
  };

  const handleRegister = async () => {
    try {
      if (!registerData.nombre || !registerData.direccion || 
          !registerData.capacidad || !registerData.email || 
          !registerData.password || !registerData.confirmPassword) {
        Alert.alert('Error', 'Todos los campos marcados con * son obligatorios');
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: registerData.nombre,
          direccion: registerData.direccion,
          ciudad: registerData.ciudad,
          capacidad: registerData.capacidad,
          email: registerData.email,
          password: registerData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Registro completado correctamente');
        setShowRegister(false);
        setRegisterData({
          nombre: '',
          direccion: '',
          ciudad: '',
          capacidad: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        Alert.alert('Error', data.error || 'Error en el registro');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
      console.error('Error de registro:', error);
    }
  };

  return (

    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
    <View style={styles.container}>
      <Ionicons name="car-sport" style={styles.logoContainer} /> 
      <Text style={styles.title}>ParkIO</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor={COLORS.grey}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          onSubmitEditing={dismissKeyboard}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.grey}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={dismissKeyboard}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowRegister(true)}
        >
          <Text style={styles.secondaryText}>Registre su estacionamiento</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Registro */}
      <Modal visible={showRegister} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Registro</Text>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="person-circle-outline" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del estacionamiento*"
                    placeholderTextColor={COLORS.grey}
                    value={registerData.nombre}
                    onChangeText={text => setRegisterData(prev => ({...prev, nombre: text}))}
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Dirección*"
                    placeholderTextColor={COLORS.grey}
                    value={registerData.direccion}
                    onChangeText={text => setRegisterData(prev => ({...prev, direccion: text}))}
                    onSubmitEditing={dismissKeyboard}
                    />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="business" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  />  
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  placeholderTextColor={COLORS.grey}
                  value={registerData.ciudad}
                  onChangeText={text => setRegisterData(prev => ({...prev, ciudad: text}))}
                  onSubmitEditing={dismissKeyboard}
                />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="car-sport" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  /> 
                  <TextInput
                    style={styles.input}
                    placeholder="Capacidad de vehículos*"
                    placeholderTextColor={COLORS.grey}
                    keyboardType="numeric"
                    value={registerData.capacidad}
                    onChangeText={text => setRegisterData(prev => ({...prev, capacidad: text}))}
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="mail" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  />  
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico*"
                    placeholderTextColor={COLORS.grey}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={registerData.email}
                  onChangeText={text => setRegisterData(prev => ({...prev, email: text}))}
                  onSubmitEditing={dismissKeyboard}
                />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="lock-closed" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña*"
                    placeholderTextColor={COLORS.grey}
                    secureTextEntry
                    value={registerData.password}
                    onChangeText={text => setRegisterData(prev => ({...prev, password: text}))}
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="lock-closed" 
                    size={20} 
                    color={COLORS.grey}
                    style={styles.leftIcon}
                  />               
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña*"
                    placeholderTextColor={COLORS.grey}
                    secureTextEntry
                    value={registerData.confirmPassword}
                    onChangeText={text => setRegisterData(prev => ({...prev, confirmPassword: text}))}
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowRegister(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleRegister}
                  >
                    <Text style={styles.buttonText}>Registrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}