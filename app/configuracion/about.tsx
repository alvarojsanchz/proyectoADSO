//app/configuracion/about.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../styles/configuracion.styles';

export default function AboutScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    const email = 'soporte@parkio.app';
    const subject = 'Soporte ParkIO';
    const body = 'Hola, necesito ayuda con...';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      // Si no se puede abrir el cliente de email, mostrar la información
      alert(`Contacta al soporte en: ${email}`);
    });
  };

  const InfoSection = ({ 
    title, 
    children 
  }: { 
    title: string, 
    children: React.ReactNode 
  }) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de ParkIO</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Logo y versión */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Ionicons name="car-sport" size={80} color={COLORS.primary} />
          <Text style={[styles.infoCardTitle, { fontSize: 28, textAlign: 'center', marginTop: 10 }]}>
            ParkIO
          </Text>
          <Text style={[styles.infoCardText, { textAlign: 'center' }]}>
            Versión 1.0.0
          </Text>
        </View>

        {/* Descripción */}
        <InfoSection title="¿Qué es ParkIO?">
          <Text style={styles.infoCardText}>
            ParkIO es una aplicación móvil diseñada para la gestión eficiente de estacionamientos. 
            Permite registrar ingresos y salidas de vehículos, generar reportes de ocupación, 
            gestionar tarifas y obtener análisis detallados del funcionamiento del estacionamiento.
          </Text>
        </InfoSection>

        {/* Características principales */}
        <InfoSection title="Características Principales">
          <Text style={styles.infoCardText}>
            • Registro rápido de ingresos y salidas{'\n'}
            • Gestión de diferentes tipos de vehículos{'\n'}
            • Reportes de ocupación en tiempo real{'\n'}
            • Análisis contable y financiero{'\n'}
            • Configuración flexible de tarifas{'\n'}
            • Historial completo de tickets{'\n'}
            • Interfaz intuitiva y moderna
          </Text>
        </InfoSection>

        {/* Información técnica */}
        <InfoSection title="Información Técnica">
          <Text style={styles.infoCardText}>
            Desarrollado con React Native y Expo{'\n'}
            Base de datos MySQL{'\n'}
            Backend en Node.js{'\n'}
            Compatible con Android e iOS
          </Text>
        </InfoSection>

        {/* Desarrollador */}
        <InfoSection title="Desarrollado con ♥️">
          <Text style={styles.infoCardText}>
            Alvaro Jiménez Sánchez
            Proyecto ADSO - Análisis y Desarrollo de Software{'\n'}
            SENA - Servicio Nacional de Aprendizaje
          </Text>
        </InfoSection>

        {/* Soporte */}
        <InfoSection title="Soporte y Contacto">
          <Text style={styles.infoCardText}>
            ¿Necesitas ayuda o tienes alguna sugerencia?{'\n'}
            Contáctanos y te ayudaremos.
          </Text>
          <TouchableOpacity 
            style={[styles.saveButton, { marginTop: 15 }]}
            onPress={handleContactSupport}
          >
            <Text style={styles.saveButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
        </InfoSection>

        {/* Términos y privacidad */}
        <InfoSection title="Legal">
          <Text style={styles.infoCardText}>
            Esta aplicación está diseñada con fines educativos como parte del programa de 
            formación ADSO. Los datos son almacenados de forma segura y no se comparten 
            con terceros.
          </Text>
        </InfoSection>

        {/* Agradecimientos */}
        <InfoSection title="Agradecimientos">
          <Text style={styles.infoCardText}>
            Agradecemos al SENA por brindar la oportunidad de desarrollar este proyecto 
            y a todos los instructores que han guiado el proceso de aprendizaje.
          </Text>
        </InfoSection>

        {/* Espaciado final */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}