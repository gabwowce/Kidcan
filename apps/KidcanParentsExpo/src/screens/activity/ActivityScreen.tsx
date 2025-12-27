// src/screens/activity/ActivityScreen.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../../components/common/AppText";
import { Screen } from "../../components/layout/Screen";

const ActivityScreen: React.FC = () => {
  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <AppText size={24} weight="heavy" color="#362F27">
          Activity
        </AppText>
        <View style={styles.headerBadge} />
      </View>

      {/* čia vėliau įdėsi realų feed'ą */}
      <View style={styles.card}>
        <AppText size={14} weight="medium" color="#8B7A67">
          Recent activity list will live here.
        </AppText>
      </View>
    </Screen>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FEF7EC",
  },
  header: {
    marginTop: 4,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFE3BF",
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
