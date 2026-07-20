import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CustomerMarketplaceScreen } from "../screens/CustomerMarketplaceScreen";
import { CustomerOrderDetailScreen } from "../screens/CustomerOrderDetailScreen";
import { DriverDeliveryDetailScreen } from "../screens/DriverDeliveryDetailScreen";
import { DriverJobsScreen } from "../screens/DriverJobsScreen";
import { LoginScreen } from "../screens/LoginScreen";

const tabs = ["Home", "Market", "Tools", "Give", "Me"] as const;
type Tab = (typeof tabs)[number];

export function RootNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>("Market");

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen(activeTab)}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable accessibilityRole="button" key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function renderScreen(tab: Tab) {
  switch (tab) {
    case "Home":
      return <LoginScreen />;
    case "Market":
      return <CustomerMarketplaceScreen />;
    case "Tools":
      return <CustomerOrderDetailScreen />;
    case "Give":
      return <DriverJobsScreen />;
    case "Me":
      return <DriverDeliveryDetailScreen />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: "row",
    borderTopColor: "#DDE5DF",
    borderTopWidth: 1,
    backgroundColor: "#FFFFFF"
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center"
  },
  activeTab: {
    backgroundColor: "#EDF7F0"
  },
  tabText: {
    color: "#3B4A40",
    fontWeight: "600"
  },
  activeTabText: {
    color: "#17612F"
  }
});
