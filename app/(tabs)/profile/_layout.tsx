import { Stack } from "expo-router";

export default function LeadsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="accountSettings" options={{ headerShown: false }} />
      <Stack.Screen name="personalInfo" options={{ headerShown: false }} />
    </Stack>
  );
}
