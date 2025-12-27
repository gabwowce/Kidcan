// src/screens/settings/ProfileScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile (stub)</Text>
      <Text style={styles.subtitle}>
        Čia vėliau galėsim rodyti tėvo profilį, vardą, email ir t.t.
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

export default ProfileScreen;
