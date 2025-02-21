import { Tabs } from 'expo-router';
import React from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Latest',
          headerShown: false,
          tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="premier"
        options={{
          title: 'PL',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="wolf-pack-battalion" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: true,
          tabBarIcon: ({ color }) => <Fontisto name="more-v-a" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}
