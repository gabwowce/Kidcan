import React from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {sendChildLocation} from '../api/geofencing';

type Props = {
  childId: number;
};

export const TestGeofenceButton: React.FC<Props> = ({childId}) => {
  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Lokacijos leidimas',
        message:
          'Kidcan reikia lokacijos, kad galėtume tikrinti saugias zonas.',
        buttonPositive: 'Leisti',
        buttonNegative: 'Atšaukti',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleSendTestLocation = async () => {
    const hasPerm = await requestLocationPermission();
    if (!hasPerm) {
      Alert.alert('Lokacija', 'Be leidimo negalime gauti lokacijos.');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        try {
          const {latitude, longitude, accuracy} = position.coords;
          console.log('Child position =>', latitude, longitude, accuracy);

          const events = await sendChildLocation(
            childId,
            latitude,
            longitude,
            accuracy,
          );

          console.log('Geofence events =>', events);

          if (!events || events.length === 0) {
            Alert.alert('Geofencing', 'Naujų įvykių nėra');
            return;
          }

          const msg = events
            .map(
              e =>
                `${e.event_type === 'ENTER' ? 'ENTER' : 'EXIT'} · geofence ${
                  e.geofence_id
                } (${e.created_at})`,
            )
            .join('\n');

          Alert.alert('Geofencing', msg);
        } catch (e) {
          console.log('sendChildLocation error', e);
          Alert.alert('Klaida', 'Nepavyko nusiųsti lokacijos');
        }
      },
      error => {
        console.log('getCurrentPosition error', error);
        Alert.alert('Lokacija', 'Nepavyko gauti lokacijos');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendTestLocation}
        activeOpacity={0.8}>
        <Text style={styles.text}>Send test location (geofence)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginTop: 12},
  button: {
    borderRadius: 999,
    backgroundColor: '#222',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {color: '#fff', fontSize: 14, fontWeight: '600'},
});
