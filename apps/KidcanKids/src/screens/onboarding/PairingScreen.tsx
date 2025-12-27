// src/screens/onboarding/PairingScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {supabase} from '../../api/supabaseClient'; // <- svarbu
import {useApp} from '../../contexts/AppContext';
import {getFcmTokenSafely} from '../../firebase/messaging';

import {setNativeChildContext, startBaseTracking} from '../../native/kidcan';
import type {RootStackParamList} from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPairing'>;

type ClaimResult = {
  success: boolean;
  childId: number;
  parentId: number | null;
  childName: string | null;
  childGender: string | null;
  deviceId: number;
};

const DEVICE_ID_KEY = 'kidcan_device_id';

const PairingScreen: React.FC<Props> = ({navigation}) => {
  const {setChildPairing} = useApp();

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // sugeneruojam ir išsisaugom deviceId (MVP)
  useEffect(() => {
    const loadId = async () => {
      try {
        const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (existing) {
          setDeviceId(existing);
          return;
        }
        const randomId = `ANDROID-${Date.now()}-${Math.floor(
          Math.random() * 100000,
        )}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, randomId);
        setDeviceId(randomId);
      } catch (e) {
        console.log('deviceId error', e);
      }
    };
    loadId();
  }, []);

  const handlePair = async () => {
    const trimmed = code.trim();

    if (!trimmed || trimmed.length !== 6) {
      Alert.alert('Klaida', 'Įvesk 6 skaitmenų kodą iš tėvų programėlės.');
      return;
    }
    if (!deviceId) {
      Alert.alert('Klaida', 'Nepavyko gauti įrenginio ID. Pabandyk dar kartą.');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('[PAIR] start', {trimmed, deviceId});

      // 🔹 GAUNAM FCM TOKEN
      const fcmToken = await getFcmTokenSafely();

      const {data, error} = await supabase.functions.invoke<ClaimResult>(
        'pairing',
        {
          body: {
            action: 'claim_child_device',
            code: trimmed,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
            deviceId,
            fcmToken,
          },
        },
      );

      console.log('[PAIR] response', {data, error});

      if (error) {
        console.log('[PAIR] supabase error', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Nepavyko susieti');
      }

      if (!data?.childId) {
        throw new Error('Trūksta childId atsakyme');
      }

      const childName = data.childName || '';
      setChildPairing(data.childId, childName);

      // 👇 pasakom Native, koks child + device ir paleidžiam trackingą
      if (deviceId) {
        try {
          await setNativeChildContext(data.childId, deviceId);
          await startBaseTracking(); // ForegroundService startas
        } catch (e) {
          console.log('native tracking init error', e);
        }
      }

      Alert.alert('Sėkmė', `Susieta su vaiku: ${childName || data.childId}`, [
        {
          text: 'Gerai',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{name: 'MainTabs'}],
            }),
        },
      ]);
    } catch (e: any) {
      console.log('[PAIR] catch error', e);
      Alert.alert(
        'Klaida',
        e?.message ||
          'Nepavyko susieti su tėvų programėle. Patikrink kodą ir bandyk dar kartą.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>Susiekime su tėvų programėle</Text>
        <Text style={styles.subtitle}>
          Paprašyk tėčio ar mamos atsidaryti „Kidcan Parents“ programėlę ir
          paspausti „GET CODE“. Įvesk žemiau gautą 6 skaitmenų kodą.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="••••••"
          value={code}
          onChangeText={text => setCode(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handlePair}
          disabled={isSubmitting}>
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Jungiama...' : 'SUSIETI'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helper}>
          Jei nepavyksta, patikrink ar kodas dar galioja (jis galioja ~10 min).
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PairingScreen;

// ... styles palieku tokius pačius

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', justifyContent: 'center'},
  content: {paddingHorizontal: 24},
  title: {fontSize: 24, fontWeight: '700', marginBottom: 12},
  subtitle: {fontSize: 14, color: '#555', marginBottom: 24},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2F80ED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  helper: {
    fontSize: 12,
    color: '#777',
    marginTop: 12,
  },
});
