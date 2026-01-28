import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, sharedTokens } from '@/theme';
import { ConversationsScreen, ContactsScreen, ProfileScreen } from '@/screens/main';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<string, { active: IconName; inactive: IconName }> = {
  Conversations: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Contacts: { active: 'people', inactive: 'people-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = tabIcons[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#07C160',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#E5E5EA',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Conversations" 
        component={ConversationsScreen}
        options={{ tabBarLabel: '消息' }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ tabBarLabel: '通讯录' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
});
