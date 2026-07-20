import { StyleSheet, Text, View } from "react-native";

export function DriverDeliveryDetailScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Me</Text>
      <Text style={styles.body}>Profile, earnings, delivery history, and session controls will land here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { color: "#16211A", fontSize: 24, fontWeight: "700" },
  body: { color: "#3B4A40", fontSize: 16, lineHeight: 24, marginTop: 8 }
});
