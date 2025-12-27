import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ChevronRight} from 'lucide-react-native';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import type {RootStackParamList} from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingSurvey'>;

const QUESTIONS = [
  {
    id: 'screenTime',
    question: 'On average, how many hours per day do you spend on your phone?',
    type: 'slider' as const,
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 'habits',
    question: 'Which habits would you like to change?',
    type: 'multiselect' as const,
    options: [
      'Scrolling social media',
      'Watching short videos',
      'Mobile gaming',
      'Late night usage',
      'Constant checking',
    ],
  },
  {
    id: 'goal',
    question: 'What is your main goal?',
    type: 'single' as const,
    options: [
      'More focus for work/study',
      'Better sleep quality',
      'More time with family',
      'Reduce anxiety',
      'Build self-discipline',
    ],
  },
  {
    id: 'strugglingTimes',
    question: 'At what times of day do you struggle the most?',
    type: 'multiselect' as const,
    options: ['Morning', 'During work/school', 'Evening', 'Late night'],
  },
  {
    id: 'motivation',
    question: 'How motivated are you to change your habits?',
    type: 'slider' as const,
    options: [1, 2, 3, 4, 5],
  },
];

export default function SurveyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, number | string | string[]>
  >({});

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: number | string) => {
    if (currentQuestion.type === 'multiselect') {
      const current = (answers[currentQuestion.id] as string[]) || [];
      const newValue = current.includes(value as string)
        ? current.filter(v => v !== value)
        : [...current, value as string];
      setAnswers({...answers, [currentQuestion.id]: newValue});
    } else {
      setAnswers({...answers, [currentQuestion.id]: value});
    }
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined;
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate('OnboardingProjection', {
        data: answers,
      });
    }
  };

  const isSelected = (option: string | number) => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(answer) && answer.includes(option as string);
    }
    return answer === option;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {width: `${progress}%`}]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <Text style={styles.stepText}>
          Question {currentStep + 1} of {QUESTIONS.length}
        </Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.type === 'slider' ? (
            <View style={styles.sliderOptions}>
              {currentQuestion.options.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sliderOption,
                    isSelected(option) && styles.sliderOptionSelected,
                  ]}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.sliderOptionText,
                      isSelected(option) && styles.sliderOptionTextSelected,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.buttonOptions}>
              {currentQuestion.options.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    isSelected(option) && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.optionButtonText,
                      isSelected(option) && styles.optionButtonTextSelected,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.nextButton,
          !canProceed() && styles.nextButtonDisabled,
          {marginBottom: insets.bottom + 24},
        ]}
        onPress={handleNext}
        disabled={!canProceed()}
        activeOpacity={0.8}>
        <View
          style={[
            styles.nextButtonInner,
            !canProceed() && styles.nextButtonInnerDisabled,
          ]}>
          <Text style={styles.nextButtonText}>Continue</Text>
          <ChevronRight size={20} color={colors.card} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundSoft,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: 12,
    fontWeight: '500',
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  sliderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  sliderOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  sliderOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sliderOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSoft,
  },
  sliderOptionTextSelected: {
    color: colors.card,
  },
  buttonOptions: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSoft,
  },
  optionButtonTextSelected: {
    color: colors.text,
  },
  nextButton: {
    margin: 24,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonInner: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
  },
  nextButtonInnerDisabled: {
    backgroundColor: colors.backgroundSoft,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
  },
});
