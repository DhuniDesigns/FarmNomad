import { StyleSheet, Text, View } from "react-native";

export function CustomerOrderDetailScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Tools</Text>
      <Text style={styles.body}>Future crop scanner, order detail, and guidance surfaces will sit behind this tab.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { color: "#16211A", fontSize: 24, fontWeight: "700" },
  body: { color: "#3B4A40", fontSize: 16, lineHeight: 24, marginTop: 8 }
});
