import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

export async function getFcmTokenSafely(): Promise<string | null> {
  try {
    // iOS – reikia permission
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('[FCM] Permission not granted');
        return null;
      }
    }

    const token = await messaging().getToken();
    console.log('[FCM] token', token);
    return token;
  } catch (e) {
    console.log('[FCM] get token error', e);
    return null;
  }
}
