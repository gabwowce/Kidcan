// src/components/onboarding/OnboardingScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { type ReactNode } from "react";
import { StyleSheet, type TextStyle, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../../theme";
import { AppText } from "../common/AppText";
import { OnboardingProgress } from "./OnboardingProgress";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  showProgress?: boolean;
  contentStyle?: ViewStyle;
  showBackButton?: boolean;
};

export const OnboardingScreen: React.FC<Props> = ({
  children,
  footer,
  showProgress = true,
  contentStyle,
  showBackButton = true,
}) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        {showBackButton && navigation.canGoBack() && (
          <AppText
            size={18}
            weight="bold"
            color={colors.textDark}
            style={styles.backIcon}
            onPress={handleBack}
          >
            ←
          </AppText>
        )}

        {showProgress && (
          <View style={styles.headerRight}>
            <OnboardingProgress />
          </View>
        )}
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
};

// bendras klausimo tekstas – tik layout
export const onboardingQuestionText: TextStyle = {
  textAlign: "center",
  marginTop: spacing.lg,
  marginBottom: spacing.lg,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding,
    paddingHorizontal: spacing.xl,
    paddingTop: 16,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backIcon: {
    marginRight: 12,
  },
  headerRight: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {},
});
