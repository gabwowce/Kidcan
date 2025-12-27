// ---- Timestamp'ai loguose ----
const originalLog = console.log;
console.log = (...args) => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().split(' ')[0];
  const millis = String(now.getMilliseconds()).padStart(3, '0');
  originalLog(`[${date} ${time}.${millis}]`, ...args);
};
// -------------------------------

import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
