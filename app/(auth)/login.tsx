import { useSSO } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { COLORS } from '../../constants/theme'
import { styles } from '../../styles/auth.styles'

export default function login() {

    const {startSSOFlow} = useSSO()
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            const {createdSessionId, setActive}=await startSSOFlow({strategy: 'oauth_google'})

            if (setActive && createdSessionId) {
                setActive({session: createdSessionId})
                router.replace('/(tabs)')
            }
        } catch (error) {
            console.error("OAuth error: ", error)
        }
    }

  return (
    <View style={styles.container}>
      
        {/* SECCION DE LOGO */}
        <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
            <Ionicons name="car-sport-sharp" size={50} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>ParkIO</Text>
        </View>

        {/* ILUSTRACION */}
        <View style={styles.illustrationContainer}>
            <Image 
            source={require('../../assets/images/auth-img.png')} 
            style={styles.illustration} 
            resizeMode='cover'
            />
        </View>

        {/* SECCION DE LOGIN */}
        <View style={styles.loginSection}>
            <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.9}
            >
            <View style={styles.googleIconContainer}>
                <Ionicons name='logo-google' size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
                Al iniciar sesión, acepta los términos y condiciones de uso.
            </Text>    
        </View>
    </View>
  )
}
