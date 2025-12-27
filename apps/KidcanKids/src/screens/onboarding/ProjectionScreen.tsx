import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ChevronRight} from 'lucide-react-native';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import type {RootStackParamList} from '../../navigation/RootNavigator';

type ProjectionRouteProp = RouteProp<
  RootStackParamList,
  'OnboardingProjection'
>;
type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingProjection'
>;

const PROJECTION_SCREENS = [
  {
    type: 'bad' as const,
    getContent: (screenTime: number) => {
      const daysPerYear = (screenTime * 365) / 24;
      const yearsInLifetime = (screenTime * 365 * 60) / (24 * 365);
      return {
        title: "The tough news is that you're on track to spend",
        highlight: `${Math.round(daysPerYear)} days`,
        subtitle: 'on your phone this year.',
        extra: `That's about ${yearsInLifetime.toFixed(
          1,
        )} years of your life looking down at your screen.`,
        caption:
          'Projection based on your answers and an average of 16 waking hours per day.',
      };
    },
  },
  {
    type: 'good' as const,
    getContent: (screenTime: number) => {
      const potentialSaved = screenTime * 0.4;
      const yearsSaved = (potentialSaved * 365 * 60) / (24 * 365);
      return {
        title:
          'The hopeful news is that with gentle changes you could get back',
        highlight: `${yearsSaved.toFixed(1)}+ years`,
        subtitle: 'of your life, free from distractions,',
        extra: 'and use that time for what really matters.',
        caption: 'Based on your profile and a recommended focus plan.',
      };
    },
  },
];

export default function ProjectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ProjectionRouteProp>();
  const [currentScreen, setCurrentScreen] = useState(0);

  const data = route.params?.data ?? {};
  const screenTimeHours = (data.screenTime as number) || 5;

  const screen = PROJECTION_SCREENS[currentScreen];
  const content = screen.getContent(screenTimeHours);
  const isLastScreen = currentScreen === PROJECTION_SCREENS.length - 1;

  const handleNext = () => {
    if (isLastScreen) {
      navigation.navigate('OnboardingPermissions', {data});
    } else {
      setCurrentScreen(prev => prev + 1);
    }
  };

  const highlightBg =
    screen.type === 'bad' ? styles.highlightBad : styles.highlightGood;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 60),
          paddingBottom: Math.max(insets.bottom + 24, 60),
        },
      ]}>
      <View style={styles.content}>
        <Text style={styles.title}>{content.title}</Text>

        <View style={[styles.highlightBox, highlightBg]}>
          <Text style={styles.highlight}>{content.highlight}</Text>
        </View>

        <Text style={styles.subtitle}>{content.subtitle}</Text>
        <Text style={styles.extra}>{content.extra}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.caption}>{content.caption}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}>
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>
              {isLastScreen ? 'Get Started' : 'Continue'}
            </Text>
            <ChevronRight size={20} color={colors.card} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 32,
  },
  highlightBox: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  highlightBad: {
    backgroundColor: colors.accent, // švelni rožinė „ouch“
  },
  highlightGood: {
    backgroundColor: colors.success, // mėtų žalia „yay“
  },
  highlight: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.card,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  extra: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  bottom: {
    gap: 20,
  },
  caption: {
    fontSize: 13,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    width: '100%',
  },
  buttonInner: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
  },
});
