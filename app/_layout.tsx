import { DarkTheme, DefaultTheme, ThemeProvider, useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IconButton } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
// Prevent the splash screen from auto-hiding before asset loading is complete.

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const router = useRouter();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PlayFair: require('../assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf'),
    InstrumentSans: require('../assets/fonts/InstrumentSans.ttf'),
    InstrumentSansItalics: require('../assets/fonts/InstrumentSans-Italic.ttf'),
    InstrumentSansBold: require('../assets/fonts/InstrumentSans-Bold.ttf'),
    InstrumentSansSemiBold: require('../assets/fonts/InstrumentSans-SemiBold.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#E7F0FA' },
                headerTintColor: 'black',
                headerTitleStyle: { fontWeight: 'bold' },
                headerLeft: () => (
                  <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => router.push('/')}
                    style={[styles.backButton, styles.iconContainer]}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="forgot-password"
              options={{
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#E7F0FA' },
                headerTintColor: 'black',
                headerTitleStyle: { fontWeight: 'bold' },
                headerLeft: () => (
                  <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, styles.iconContainer]}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="signup"
              options={{
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#E7F0FA' },
                headerTintColor: 'black',
                headerTitleStyle: { fontWeight: 'bold' },
                headerLeft: () => (
                  <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, styles.iconContainer]}
                  />
                ),
              }}
            />
            
            <Stack.Screen
              name="steps"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="verification"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="reset-password"
              options={{
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#E7F0FA' },
                headerTintColor: 'black',
                headerTitleStyle: { fontWeight: 'bold' },
                headerLeft: () => (
                  <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, styles.iconContainer]}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="change-password"
              options={{
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#E7F0FA' },
                headerTintColor: 'black',
                headerTitleStyle: { fontWeight: 'bold' },
                headerLeft: () => (
                  <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, styles.iconContainer]}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="+not-found"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
          <Toast />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 5,
  },
  iconContainer: {},
});
