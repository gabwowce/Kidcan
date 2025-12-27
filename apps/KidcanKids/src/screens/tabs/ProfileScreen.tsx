import {
  Settings,
  Sparkles,
  Target,
  User as UserIcon,
} from 'lucide-react-native';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import {useApp} from '../../contexts/AppContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {state} = useApp();

  const daysActive = Math.floor(
    (Date.now() - state.profile.startDate) / (1000 * 60 * 60 * 24),
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <UserIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{daysActive}</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Target size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Main Goal</Text>
              <Text style={styles.infoValue}>
                {state.profile.mainGoal || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Sparkles size={20} color={colors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Motivation Level</Text>
              <View style={styles.motivationBar}>
                {[1, 2, 3, 4, 5].map(level => (
                  <View
                    key={level}
                    style={[
                      styles.motivationDot,
                      level <= state.profile.motivationLevel &&
                        styles.motivationDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Struggling Times</Text>
          <View style={styles.tagsContainer}>
            {state.profile.strugglingTimes.length > 0 ? (
              state.profile.strugglingTimes.map((time: string) => (
                <View key={time} style={styles.tag}>
                  <Text style={styles.tagText}>{time}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>None specified</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habits to Change</Text>
          <View style={styles.tagsContainer}>
            {state.profile.strugglingHabits.length > 0 ? (
              state.profile.strugglingHabits.map((habit: string) => (
                <View key={habit} style={styles.tag}>
                  <Text style={styles.tagText}>{habit}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>None specified</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingsCard}>
            <View style={styles.settingsIcon}>
              <Settings size={24} color={colors.textSoft} />
            </View>
            <Text style={styles.settingsText}>More settings coming soon!</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSoft,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSoft,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  },
  motivationBar: {
    flexDirection: 'row',
    gap: 8,
  },
  motivationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.backgroundSoft,
  },
  motivationDotActive: {
    backgroundColor: colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: '500' as const,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSoft,
    fontStyle: 'italic' as const,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  settingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 14,
    color: colors.textSoft,
    flex: 1,
  },
});
