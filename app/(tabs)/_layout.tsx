import { Tabs, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [showTabs, setShowTabs] = useState(true);

  useEffect(() => {
    // If there are more than one segment (e.g. ['dashboard', 'details']), hide tabs
    // But if it's just ['dashboard'] or ['explore'], show tabs
    if (segments.length === 2) {
      setShowTabs(true);
    } else {
      setShowTabs(false);
    }
  }, [segments]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#34D399',
        tabBarStyle: showTabs
          ? Platform.select({
              ios: {
                position: 'absolute',
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#ccc',
              },
              default: {
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#ccc',
              },
            })
          : { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.2.squarepath" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
