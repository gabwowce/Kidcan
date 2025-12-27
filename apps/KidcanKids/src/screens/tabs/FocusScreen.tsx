import {Pause, Play, X} from 'lucide-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import {useApp} from '../../contexts/AppContext';

const DURATION_OPTIONS = [25, 45, 60, 90, 120];

function vibrateImpact(level: 'light' | 'medium' | 'heavy') {
  if (Platform.OS === 'web') {
    return;
  }
  const duration = level === 'heavy' ? 60 : level === 'medium' ? 40 : 20;
  Vibration.vibrate(duration);
}

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const {startFocusSession, completeFocusSession} = useApp();

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isSessionActive && !isPaused && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionActive, isPaused, remainingSeconds]);

  useEffect(() => {
    if (isSessionActive) {
      const progress = 1 - remainingSeconds / (selectedDuration * 60);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [remainingSeconds, selectedDuration, isSessionActive, progressAnim]);

  const handleStartSession = () => {
    const id = startFocusSession(selectedDuration, []);
    setSessionId(id);
    setRemainingSeconds(selectedDuration * 60);
    setIsSessionActive(true);
    setIsPaused(false);

    vibrateImpact('medium');
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
    vibrateImpact('light');
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setRemainingSeconds(0);
    setSessionId(null);
    progressAnim.setValue(0);
  };

  const handleSessionComplete = () => {
    if (sessionId) {
      completeFocusSession(sessionId);
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100);
      }
    }
    setIsSessionActive(false);
    setIsPaused(false);
    setSessionId(null);
    progressAnim.setValue(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Focus Session</Text>

        {!isSessionActive ? (
          <>
            <Text style={styles.subtitle}>
              Choose your focus duration and start a session
            </Text>

            <View style={styles.durationSelector}>
              {DURATION_OPTIONS.map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationOption,
                    selectedDuration === duration &&
                      styles.durationOptionSelected,
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === duration &&
                        styles.durationTextSelected,
                    ]}>
                    {duration}
                  </Text>
                  <Text
                    style={[
                      styles.durationLabel,
                      selectedDuration === duration &&
                        styles.durationLabelSelected,
                    ]}>
                    min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSession}
              activeOpacity={0.8}>
              <View style={styles.startButtonInner}>
                <Text style={styles.startButtonText}>Start Focus Session</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>During Focus Mode</Text>
              <Text style={styles.infoText}>
                Stay focused on your goals. When you try to open distracting
                apps, you&apos;ll see a gentle reminder to get back on track.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.activeSession}>
            <View style={styles.timerContainer}>
              <View style={styles.progressRing}>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[styles.progressFill, {width: progress}]}
                  />
                </View>
              </View>
              <Text style={styles.timerText}>
                {formatTime(remainingSeconds)}
              </Text>
              <Text style={styles.timerLabel}>
                {isPaused ? 'Paused' : 'Remaining'}
              </Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePauseToggle}
                activeOpacity={0.7}>
                <View style={styles.controlButtonInner}>
                  {isPaused ? (
                    <Play size={32} color={colors.card} fill={colors.card} />
                  ) : (
                    <Pause size={32} color={colors.card} fill={colors.card} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButtonSecondary}
                onPress={handleStopSession}
                activeOpacity={0.7}>
                <X size={24} color={colors.accent} />
                <Text style={styles.controlButtonSecondaryText}>End</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.motivationCard}>
              <Text style={styles.motivationText}>
                Stay strong! Your pet is rooting for you.
              </Text>
              <Text style={styles.motivationEmoji}>🐱 💪</Text>
            </View>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSoft,
    marginBottom: 24,
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  durationOption: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.backgroundSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  durationOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSoft,
  },
  durationTextSelected: {
    color: colors.card,
  },
  durationLabel: {
    fontSize: 12,
    color: colors.textSoft,
  },
  durationLabelSelected: {
    color: colors.card,
  },
  startButton: {
    marginBottom: 24,
  },
  startButtonInner: {
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
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSoft,
  },
  activeSession: {
    marginTop: 24,
    gap: 24,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 12,
  },
  progressRing: {
    width: '100%',
    paddingVertical: 8,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.backgroundSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  timerText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSoft,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  controlButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonSecondaryText: {
    color: colors.accent,
    fontWeight: '600',
  },
  motivationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  motivationText: {
    color: colors.textSoft,
    fontSize: 14,
  },
  motivationEmoji: {
    fontSize: 20,
  },
});
