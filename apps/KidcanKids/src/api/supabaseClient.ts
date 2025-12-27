// src/api/supabaseClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://ysvokjlcxqvrjqqjvxmi.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzdm9ramxjeHF2cmpxcWp2eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjkwOTUsImV4cCI6MjA3OTAwNTA5NX0.ze_EUiOMX7njpUsjWL9auXCxovJidQ5-nPWFL6-2IEo';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env kintamieji nesetinti!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN nereikia URL
  },
});
