 
import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TournamentCalendarScreen from './src/screens/TournamentCalendarScreen';
import { useFonts, SourceSans3_400Regular, SourceSans3_600SemiBold, SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3';

export default function App() { 
  const [fontsLoaded] = useFonts({ SourceSans3_400Regular, SourceSans3_600SemiBold, SourceSans3_700Bold });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <TournamentCalendarScreen/>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {},
  heading: {},
  placeholder: {},
});
