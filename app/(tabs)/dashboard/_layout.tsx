import { Stack } from "expo-router";

export default function LeadsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="airtime" options={{ headerShown: false }} />
      <Stack.Screen name="buy_airtime" options={{ headerShown: false }} />
      <Stack.Screen name="data_sub" options={{ headerShown: false }} />
      <Stack.Screen name="buy_data" options={{ headerShown: false }} />
      <Stack.Screen name="pay_bills" options={{ headerShown: false }} />
      <Stack.Screen name="otpValidation" options={{ headerShown: false }} />
    </Stack>
  );
}
