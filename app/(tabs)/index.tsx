import { Link } from "expo-router";
import { View } from "react-native";
import { styles } from "../../styles/auth.styles";

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/registro">Visite la pagina de registro</Link>
      <Link href="/informacion">Visite la pagina de informacion</Link>
    </View>
  );
}


