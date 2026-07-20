import { StyleSheet, Text, View } from "react-native";

export function DriverJobsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Give</Text>
      <Text style={styles.body}>Driver jobs and donation handovers are post-MVP flows scaffolded for later build-out.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { color: "#16211A", fontSize: 24, fontWeight: "700" },
  body: { color: "#3B4A40", fontSize: 16, lineHeight: 24, marginTop: 8 }
});
