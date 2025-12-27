// src/screens/tabs/StatsScreen.tsx
import {BarChart3, Clock, Flame, TrendingUp} from 'lucide-react-native';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import {useApp} from '../../contexts/AppContext';

type DailyStat = {
  date: string;
  focusMinutes: number;
  pointsEarned: number;
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const {state} = useApp();

  const dailyStats = (state.dailyStats ?? []) as DailyStat[];

  const todayStats = dailyStats.find(d => d.date === new Date().toDateString());

  const totalFocusMinutes = dailyStats.reduce(
    (sum, day) => sum + (day.focusMinutes || 0),
    0,
  );

  const totalPointsEarned = dailyStats.reduce(
    (sum, day) => sum + (day.pointsEarned || 0),
    0,
  );

  const averageFocusPerDay =
    dailyStats.length > 0
      ? Math.round(totalFocusMinutes / dailyStats.length)
      : 0;

  const last7Days = dailyStats.slice(-7);
  const maxFocus =
    last7Days.length > 0
      ? Math.max(...last7Days.map(d => d.focusMinutes || 0), 1)
      : 1;

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
        <Text style={styles.title}>Your Stats</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {todayStats?.focusMinutes || 0}m
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Flame size={24} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{state.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{averageFocusPerDay}m</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <BarChart3 size={24} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{totalPointsEarned}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <View style={styles.chart}>
            {last7Days.length > 0 ? (
              last7Days.map(day => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', {
                  weekday: 'short',
                });
                const height =
                  maxFocus > 0 ? (day.focusMinutes / maxFocus) * 120 : 4;

                return (
                  <View key={day.date} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBarFill,
                          {height: Math.max(height, 4)},
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{dayName}</Text>
                    <Text style={styles.chartValue}>{day.focusMinutes}m</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                No data yet. Start a focus session!
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All-Time Stats</Text>
          <View style={styles.allTimeStats}>
            <View style={styles.allTimeStat}>
              <Text style={styles.allTimeValue}>{totalFocusMinutes}m</Text>
              <Text style={styles.allTimeLabel}>Total Focus Time</Text>
            </View>
            <View style={styles.allTimeStat}>
              <Text style={styles.allTimeValue}>
                {
                  state.focusSessions.filter(
                    (s: {completed: boolean}) => s.completed,
                  ).length
                }
              </Text>
              <Text style={styles.allTimeLabel}>Sessions Completed</Text>
            </View>

            <View style={styles.allTimeStat}>
              <Text style={styles.allTimeValue}>
                {
                  state.missions.filter(
                    (m: {status: string}) => m.status === 'completed',
                  ).length
                }
              </Text>
              <Text style={styles.allTimeLabel}>Missions Completed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  scrollView: {flex: 1},
  content: {padding: 24, paddingBottom: 40},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSoft,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    minHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 120,
    width: 14,
    borderRadius: 999,
    backgroundColor: colors.backgroundSoft,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  chartLabel: {
    marginTop: 6,
    fontSize: 10,
    color: colors.textSoft,
  },
  chartValue: {
    fontSize: 10,
    color: colors.textSoft,
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 14,
  },
  allTimeStats: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  allTimeStat: {
    gap: 4,
  },
  allTimeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  allTimeLabel: {
    fontSize: 13,
    color: colors.textSoft,
  },
});
