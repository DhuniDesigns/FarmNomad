import { StyleSheet, Text, View } from "react-native";

export function CustomerMarketplaceScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Market</Text>
      <Text style={styles.body}>Browse local produce and surplus listings from the Spring Boot API.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { color: "#16211A", fontSize: 24, fontWeight: "700" },
  body: { color: "#3B4A40", fontSize: 16, lineHeight: 24, marginTop: 8 }
});
