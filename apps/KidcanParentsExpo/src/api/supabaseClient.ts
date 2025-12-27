// src/api/supabaseClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://ysvokjlcxqvrjqqjvxmi.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzdm9ramxjeHF2cmpxcWp2eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjkwOTUsImV4cCI6MjA3OTAwNTA5NX0.ze_EUiOMX7njpUsjWL9auXCxovJidQ5-nPWFL6-2IEo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
