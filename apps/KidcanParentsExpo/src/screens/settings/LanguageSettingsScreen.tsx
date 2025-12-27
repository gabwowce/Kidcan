// src/screens/settings/LanguageSettingsScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LanguageSettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language settings (stub)</Text>
      <Text style={styles.subtitle}>
        Čia vėliau dėsim kalbų pasirinkimą (LT / EN ir t.t.).
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF7EC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#362F27",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B7A67",
    textAlign: "center",
  },
});

export default LanguageSettingsScreen;
