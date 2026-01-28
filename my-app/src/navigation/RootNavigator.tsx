import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { 
  ChatRoomScreen,
  UserInfoScreen,
  GroupInfoScreen,
  InviteMembersScreen,
  ManageMembersScreen,
  AddFriendScreen,
  FriendRequestsScreen,
  CreateGroupScreen,
  SettingsScreen,
  AccountScreen,
  PrivacyScreen,
  ChangePasswordScreen,
  NotificationSettingsScreen,
  AboutScreen,
  ReportScreen,
} from '@/screens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#000000',
        headerTitleStyle: { color: '#000000', fontWeight: '600' },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{
              headerShown: true,
              title: '聊天',
            }}
          />
          <Stack.Screen
            name="UserInfo"
            component={UserInfoScreen}
            options={{
              headerShown: true,
              title: '用户信息',
            }}
          />
          <Stack.Screen
            name="GroupInfo"
            component={GroupInfoScreen}
            options={{
              headerShown: true,
              title: '群组信息',
            }}
          />
          <Stack.Screen
            name="InviteMembers"
            component={InviteMembersScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ManageMembers"
            component={ManageMembersScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddFriend"
            component={AddFriendScreen}
            options={{
              headerShown: true,
              title: '添加好友',
            }}
          />
          <Stack.Screen
            name="FriendRequests"
            component={FriendRequestsScreen}
            options={{
              headerShown: true,
              title: '新的朋友',
            }}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroupScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: '设置',
            }}
          />
          <Stack.Screen
            name="Account"
            component={AccountScreen}
            options={{
              headerShown: true,
              title: '账户安全',
            }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyScreen}
            options={{
              headerShown: true,
              title: '隐私设置',
            }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{
              headerShown: true,
              title: '修改密码',
            }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{
              headerShown: true,
              title: '通知设置',
            }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{
              headerShown: true,
              title: '关于',
            }}
          />
          <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{
              headerShown: true,
              title: '举报',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
