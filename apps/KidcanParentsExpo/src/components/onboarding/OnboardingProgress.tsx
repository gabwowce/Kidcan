// src/components/OnboardingProgress.tsx
import { useRoute, type RouteProp } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ONBOARDING_FLOW } from '../../config/onboarding';
import type { RootStackParamList } from '../../navigation/types';
import { colors, radii } from '../../theme';

function getProgressPercent(routeName: keyof RootStackParamList): number {
  const index = ONBOARDING_FLOW.indexOf(routeName as any);
  if (index === -1) return 0;

  const total = ONBOARDING_FLOW.length;
  return ((index + 1) / total) * 100;
}

export const OnboardingProgress: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList>>();
  const progress = getProgressPercent(route.name);

  if (!progress) return null;

  return (
    <View style={styles.header}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#FFFFFFAA',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: radii.full,
  },
});
