// src/screens/onboarding/join-family/JoinFamilySuccessScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../navigation/types';
import { colors, radii, spacing } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinFamilySuccess'>;

const JoinFamilySuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { familyCode } = route.params;

  const handleContinue = () => {
    // familyCode pasiliekam, kad po signup'o galėtume užbaigti join
    navigation.replace('Register', { familyCode });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Family found 🎉</Text>
        <Text style={styles.text}>
          You’re about to join this family. Create your parent account to keep
          everyone’s data safe.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Create parent account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default JoinFamilySuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
