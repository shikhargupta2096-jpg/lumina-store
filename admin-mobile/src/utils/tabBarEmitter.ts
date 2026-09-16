import { DeviceEventEmitter } from 'react-native';

let isVisible = true;

export const hideTabBar = () => {
  if (!isVisible) return;
  isVisible = false;
  DeviceEventEmitter.emit('toggleTabBar', false);
};

export const showTabBar = () => {
  if (isVisible) return;
  isVisible = true;
  DeviceEventEmitter.emit('toggleTabBar', true);
};
