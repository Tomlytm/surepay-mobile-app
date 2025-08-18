import { Stack } from "expo-router";

export default function BillsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="bill_details" options={{ headerShown: false }} />
    </Stack>
  );
}
