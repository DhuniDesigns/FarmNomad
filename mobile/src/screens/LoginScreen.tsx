import { StyleSheet, Text, View } from "react-native";

export function LoginScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mobile auth shell</Text>
      <Text style={styles.body}>Customer and Driver registration belong to mobile after the web MVP foundations are stable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { color: "#16211A", fontSize: 24, fontWeight: "700" },
  body: { color: "#3B4A40", fontSize: 16, lineHeight: 24, marginTop: 8 }
});
