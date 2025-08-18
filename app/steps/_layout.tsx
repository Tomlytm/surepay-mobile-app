// app/steps/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false, // disables swipe back for index
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="business_info"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
