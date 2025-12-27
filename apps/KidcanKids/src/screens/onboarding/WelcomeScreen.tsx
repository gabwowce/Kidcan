import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList, "OnboardingWelcome">;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top brand */}
      <View style={styles.top}>
        <Text style={styles.brand}>KidCan</Text>
      </View>

      {/* Center illustration */}
      <View style={styles.illustrationWrap}>
        <Image
          source={require("../../../assets/onboarding/guardy.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Text + button */}
      <View style={styles.bottom}>
        <Text style={styles.title}>Hi, I&apos;m Guardy!</Text>
        <Text style={styles.subtitle}>
          I&apos;m here to help you and your family stay connected. Ready to start?
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("OnboardingPermissions")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Let&apos;s go!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1E6", // kreminis kaip screenshot'e
    paddingHorizontal: 22,
  },

  top: {
    paddingTop: 10,
  },
  brand: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2F2F2F",
  },

  illustrationWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "50%",
    height: "50%",
  },

  bottom: {
    paddingBottom: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#2F2F2F",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 18,
  },

  button: {
    width: "100%",
    backgroundColor: "#0B66FF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
});
