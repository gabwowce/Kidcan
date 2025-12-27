// src/screens/tabs/HomeScreen.tsx
import {useNavigation} from '@react-navigation/native';
import {Flame, Sparkles, TrendingUp} from 'lucide-react-native';
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {TestGeofenceButton} from '../../components/TestGeofenceButton';
import {colors} from '../../constants/colors';
import {useApp} from '../../contexts/AppContext';

type HomeScreenNavigation = any; // vėliau gali pakeist į savo tipą iš types.d.ts

type Mission = {
  id: string;
  title: string;
  points: number;
  type: 'daily' | string;
  status: 'active' | string;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {state, calculatePetState} = useApp();
  const navigation = useNavigation<HomeScreenNavigation>();

  const petState = calculatePetState();

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    bounce.start();

    return () => bounce.stop();
  }, [bounceAnim]);

  const getPetEmoji = () => {
    switch (petState) {
      case 'happy':
        return '🐱';
      case 'neutral':
        return '😺';
      case 'sad':
        return '😿';
      default:
        return '😺';
    }
  };

  const getPetMessage = () => {
    switch (petState) {
      case 'happy':
        return "I'm so proud of you! Keep it up!";
      case 'neutral':
        return "Let's do some focus work together!";
      case 'sad':
        return "I miss you... Let's focus together!";
      default:
        return "Let's start your journey!";
    }
  };

  const todayStats = state.dailyStats.find(
    (s: {date: string; focusMinutes?: number}) =>
      s.date === new Date().toDateString(),
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello!</Text>
          <View style={styles.pointsBadge}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={styles.pointsText}>{state.points}</Text>
          </View>
        </View>

        {/* Pet blokas */}
        <View style={styles.petContainer}>
          <Animated.View
            style={[
              styles.pet,
              {
                transform: [{translateY: bounceAnim}, {scale: scaleAnim}],
              },
            ]}>
            <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
          </Animated.View>

          <Text style={styles.petMessage}>{getPetMessage()}</Text>

          <View style={styles.petStateIndicator}>
            <View
              style={[
                styles.stateBar,
                petState === 'happy' && styles.stateBarHappy,
                petState === 'neutral' && styles.stateBarNeutral,
                petState === 'sad' && styles.stateBarSad,
              ]}
            />
            <Text style={styles.stateText}>
              {petState === 'happy'
                ? 'Energetic'
                : petState === 'neutral'
                ? 'Content'
                : 'Tired'}
            </Text>
          </View>
        </View>

        {/* Statistika */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {todayStats?.focusMinutes || 0}m
            </Text>
            <Text style={styles.statLabel}>Focus Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Flame size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{state.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Sparkles size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{state.points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
        </View>

        {/* Focus mygtukas */}
        <TouchableOpacity
          style={styles.focusButton}
          onPress={() => navigation.navigate('Focus' as never)}
          activeOpacity={0.8}>
          <View style={styles.focusButtonInner}>
            <Text style={styles.focusButtonText}>Start Focus Session</Text>
          </View>
        </TouchableOpacity>

        {/* TEST geofencing mygtukas */}
        <TestGeofenceButton childId={1} />
        {/* vėliau childId pasiimsi iš realaus source */}

        {/* Misijos */}
        <View style={styles.quickMissions}>
          <Text style={styles.sectionTitle}>Today's Missions</Text>
          {(state.missions as Mission[])
            .filter(m => m.type === 'daily' && m.status === 'active')
            .slice(0, 3)
            .map(mission => (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.missionContent}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <View style={styles.missionPoints}>
                    <Sparkles size={14} color={colors.primary} />
                    <Text style={styles.missionPointsText}>
                      {mission.points}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  pointsText: {
    color: colors.text,
    fontWeight: '600',
  },
  petContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  pet: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  petEmoji: {
    fontSize: 60,
  },
  petMessage: {
    fontSize: 16,
    color: colors.textSoft,
    textAlign: 'center',
  },
  petStateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateBar: {
    width: 80,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.backgroundSoft,
  },
  stateBarHappy: {
    backgroundColor: colors.success,
  },
  stateBarNeutral: {
    backgroundColor: '#FBBF24', // jei nori – gali įsidėti į colors kaip warning
  },
  stateBarSad: {
    backgroundColor: '#EF4444', // jei nori – danger spalva atskirai
  },
  stateText: {
    fontSize: 14,
    color: colors.textSoft,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSoft,
  },
  focusButton: {
    marginBottom: 24,
  },
  focusButtonInner: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  focusButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
  },
  quickMissions: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  missionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 14,
    color: colors.textSoft,
  },
  missionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missionPointsText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
