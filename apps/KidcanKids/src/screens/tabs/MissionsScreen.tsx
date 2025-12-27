// src/screens/tabs/MissionsScreen.tsx
import {CheckCircle2, Circle, Clock, Sparkles} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import {useApp} from '../../contexts/AppContext';

type Mission = {
  id: string;
  title: string;
  description?: string;
  points: number;
  type: 'daily' | 'weekly' | string;
  status: 'active' | 'completed' | string;
};

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const {state, completeMission} = useApp();

  const handleCompleteMission = (missionId: string) => {
    if (Platform.OS !== 'web') {
      // čia vėliau galima bus pridėti haptiką
    }
    completeMission(missionId);
  };

  const missions = (state.missions ?? []) as Mission[];
  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Missions</Text>
          <View style={styles.pointsBadge}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={styles.pointsText}>{state.points}</Text>
          </View>
        </View>

        {/* Daily missions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Missions</Text>
          <Text style={styles.sectionDescription}>
            Complete these every day to keep your pet happy
          </Text>

          <View style={styles.missionsList}>
            {dailyMissions.map(mission => (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.missionHeader}>
                  <View style={styles.missionIcon}>
                    {mission.status === 'completed' ? (
                      <CheckCircle2 size={24} color={colors.success} />
                    ) : (
                      <Circle size={24} color={colors.textSoft} />
                    )}
                  </View>
                  <View style={styles.missionInfo}>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    {!!mission.description && (
                      <Text style={styles.missionDescription}>
                        {mission.description}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.missionFooter}>
                  <View style={styles.missionReward}>
                    <Sparkles size={16} color={colors.primary} />
                    <Text style={styles.missionRewardText}>
                      {mission.points} points
                    </Text>
                  </View>

                  {mission.status === 'active' ? (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleCompleteMission(mission.id)}
                      activeOpacity={0.7}>
                      <LinearGradient
                        colors={[colors.primary, colors.accent]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.completeButtonGradient}>
                        <Text style={styles.completeButtonText}>Complete</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly missions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Missions</Text>
          <Text style={styles.sectionDescription}>
            Extra challenges for bigger rewards
          </Text>

          <View style={styles.missionsList}>
            {weeklyMissions.map(mission => (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.missionHeader}>
                  <View style={styles.missionIcon}>
                    {mission.status === 'completed' ? (
                      <CheckCircle2 size={24} color={colors.success} />
                    ) : (
                      <Clock size={24} color={colors.accent} />
                    )}
                  </View>
                  <View style={styles.missionInfo}>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    {!!mission.description && (
                      <Text style={styles.missionDescription}>
                        {mission.description}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.missionFooter}>
                  <View style={styles.missionReward}>
                    <Sparkles size={16} color={colors.accent} />
                    <Text style={styles.missionRewardTextWeekly}>
                      {mission.points} points
                    </Text>
                  </View>

                  {mission.status === 'completed' ? (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  ) : (
                    <View style={styles.inProgressBadge}>
                      <Text style={styles.inProgressText}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
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
  title: {
    fontSize: 28,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: 16,
  },
  missionsList: {
    gap: 12,
  },
  missionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  missionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionInfo: {
    flex: 1,
    gap: 4,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  missionDescription: {
    fontSize: 14,
    color: colors.textSoft,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  missionRewardText: {
    fontSize: 14,
    color: colors.textSoft,
  },
  missionRewardTextWeekly: {
    fontSize: 14,
    color: colors.accent,
  },
  completeButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  completedText: {
    fontSize: 12,
    color: colors.card,
    fontWeight: '600',
  },
  inProgressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  inProgressText: {
    fontSize: 12,
    color: colors.card,
    fontWeight: '600',
  },
});
