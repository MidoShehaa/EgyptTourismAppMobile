import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './src/store/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}
