// src/screens/onboarding/join-family/JoinFamilyHelpScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../navigation/types';
import { colors, radii, spacing } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinFamilyHelp'>;

const JoinFamilyHelpScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sheet}>
        {/* handle viršuje */}
        <View style={styles.handleWrapper}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Where to get the family code</Text>

          {/* Step 1 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
              <Text style={styles.cardTitle}>
                Ask another parent to open the Kidcan Parent app
              </Text>
            </View>
            <View style={styles.imagePlaceholder} />
          </View>

          {/* Step 2 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
              <Text style={styles.cardTitle}>
                Go to Settings and tap “Add Family”
              </Text>
            </View>
            <View style={styles.imagePlaceholder} />
          </View>

          {/* Step 3 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
              <Text style={styles.cardTitle}>
                They’ll see a 6-digit family code to share with you
              </Text>
            </View>
            <View style={styles.imagePlaceholder} />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default JoinFamilyHelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding, // tas pats rožinis fonas
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#FFF6E9', // tavo „kortelės“ fonas (gali keisti į colors.cardBackground)
    borderRadius: 32,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  handleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
  },
  content: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  imagePlaceholder: {
    marginTop: 4,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#DDF2FF', // šviesiai mėlyna kaip pavyzdyje
  },
  closeButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
