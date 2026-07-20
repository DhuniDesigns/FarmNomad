import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>FarmNomad</Text>
        <Text style={styles.subtitle}>Customer and Driver pilot shell</Text>
      </View>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F8F6"
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#DDE5DF",
    borderBottomWidth: 1
  },
  brand: {
    color: "#16211A",
    fontSize: 24,
    fontWeight: "700"
  },
  subtitle: {
    color: "#3B4A40",
    marginTop: 4
  }
});
