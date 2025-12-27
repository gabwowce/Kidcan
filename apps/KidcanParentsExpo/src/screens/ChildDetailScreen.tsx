// src/screens/ChildDetailScreen.tsx
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '../api/client';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ChildDetailsRouteProp = RouteProp<RootStackParamList, 'ChildDetails'>;

export default function ChildDetailScreen() {
  const route = useRoute<ChildDetailsRouteProp>();
  const { childId, childName } = route.params;

  const [minutes, setMinutes] = useState('30');
  const [reason, setReason] = useState('Focus time');

  const handleBlockNow = async () => {
    const minsNum = Number(minutes);
    if (isNaN(minsNum) || minsNum <= 0) {
      Alert.alert('Error', 'Enter valid minutes');
      return;
    }

    try {
      // Čia vėliau pajungsim realų backend endpointą.
      await api.post(`/children/${childId}/block-now`, {
        minutes: minsNum,
        message: reason || 'Blocked by parent',
      });

      Alert.alert(
        'Block scheduled',
        `Child ${childName} will be blocked for ${minsNum} min.`,
      );
    } catch (e: any) {
      console.log('block error', e.response?.data || e.message);
      Alert.alert(
        'Error',
        e.response?.data?.detail || 'Could not schedule block',
      );
    }
  };

  const handleCancelBlock = async () => {
    try {
      await api.post(`/children/${childId}/cancel-block`, {});
      Alert.alert('Block cancelled', `Child ${childName} is unblocked.`);
    } catch (e: any) {
      console.log('cancel error', e.response?.data || e.message);
      Alert.alert(
        'Error',
        e.response?.data?.detail || 'Could not cancel block',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{childName}</Text>
      <Text style={styles.subtitle}>Child ID: {childId}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Block for (minutes):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={minutes}
          onChangeText={setMinutes}
        />

        <Text style={styles.label}>Message (shown on kid phone):</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <View style={styles.buttonsRow}>
          <Button title="15 min" onPress={() => setMinutes('15')} />
          <Button title="30 min" onPress={() => setMinutes('30')} />
          <Button title="60 min" onPress={() => setMinutes('60')} />
        </View>

        <View style={{ height: 12 }} />

        <Button title="BLOCK NOW" onPress={handleBlockNow} color="#e53935" />

        <View style={{ height: 8 }} />

        <Button title="Cancel block" onPress={handleCancelBlock} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 32 },
  name: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: { fontSize: 14, marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
