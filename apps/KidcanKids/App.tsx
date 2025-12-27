import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppProvider} from './src/contexts/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import React from 'react';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
