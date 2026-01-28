import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ContactsStackParamList } from '@/navigation/types';
import { useFriendStore } from '@/stores';
import type { Friend } from '@/types';

type NavigationProp = NativeStackNavigationProp<ContactsStackParamList>;

export function ContactsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { friends, pendingRequestCount, isLoading, fetchFriends, fetchReceivedRequests } = useFriendStore();
  const [refreshing, setRefreshing] = useState(false);

  console.log('[ContactsScreen] Render:', {
    friendsCount: friends?.length || 0,
    friendsIsArray: Array.isArray(friends),
    pendingRequestCount,
    isLoading
  });

  useEffect(() => {
    console.log('[ContactsScreen] Component mounted, fetching data');
    fetchFriends().catch(err => {
      console.error('[ContactsScreen] fetchFriends error:', err);
    });
    fetchReceivedRequests().catch(err => {
      console.error('[ContactsScreen] fetchReceivedRequests error:', err);
    });
  }, [fetchFriends, fetchReceivedRequests]);

  const handleRefresh = useCallback(async () => {
    console.log('[ContactsScreen] Refreshing');
    setRefreshing(true);
    try {
      await Promise.all([fetchFriends(), fetchReceivedRequests()]);
    } catch (err) {
      console.error('[ContactsScreen] handleRefresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFriends, fetchReceivedRequests]);

  const menuItems = [
    {
      id: 'new_friends',
      icon: 'person-add' as const,
      title: '新的好友',
      badge: pendingRequestCount,
      onPress: () => navigation.navigate('FriendRequests'),
    },
    {
      id: 'create_group',
      icon: 'people' as const,
      title: '发起群聊',
      badge: 0,
      onPress: () => navigation.navigate('CreateGroup'),
    },
  ];

  const sections = [
    {
      title: '功能',
      data: menuItems,
      type: 'menu' as const,
    },
    {
      title: `好友 (${Array.isArray(friends) ? friends.length : 0})`,
      data: Array.isArray(friends) ? friends : [],
      type: 'friends' as const,
    },
  ];

  console.log('[ContactsScreen] Sections prepared:', {
    sectionsCount: sections.length,
    friendsDataLength: sections[1].data.length
  });

  const renderMenuItem = (item: typeof menuItems[0]) => {
    console.log('[ContactsScreen] renderMenuItem:', item);
    return (
      <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.6}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon} size={20} color="#ffffff" />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
        {item.badge > 0 && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const renderFriend = (item: Friend) => {
    try {
      console.log('[ContactsScreen] renderFriend:', {
        id: item.id,
        friendId: item.friendId,
        hasFriend: !!item.friend,
        friendName: item.friend?.name,
        alias: item.alias
      });

      const displayName = item.alias || item.friend?.name || '未知用户';
      const avatarText = (item.alias?.[0] || item.friend?.name?.[0] || '?').toUpperCase();

      return (
        <TouchableOpacity 
          style={styles.friendItem} 
          activeOpacity={0.6}
          onPress={() => {
            console.log('[ContactsScreen] Friend tapped:', item.friendId);
            navigation.navigate('UserInfo', { userId: item.friendId });
          }}
        >
          <View style={styles.friendAvatar}>
            <Text style={styles.friendAvatarText}>{avatarText}</Text>
          </View>
          <View style={styles.friendContent}>
            <Text style={styles.friendName}>{displayName}</Text>
          </View>
        </TouchableOpacity>
      );
    } catch (err) {
      console.error('[ContactsScreen] renderFriend error:', {
        error: err,
        item: JSON.stringify(item).substring(0, 200)
      });
      return null;
    }
  };

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item, section }: any) => {
    try {
      console.log('[ContactsScreen] renderItem:', {
        sectionType: section.type,
        itemKeys: Object.keys(item || {}).slice(0, 5)
      });

      if (section.type === 'menu') {
        return renderMenuItem(item);
      }
      return renderFriend(item);
    } catch (err) {
      console.error('[ContactsScreen] renderItem error:', err);
      return null;
    }
  };

  type SectionData = typeof sections[number];

  if (isLoading && (!friends || friends.length === 0)) {
    console.log('[ContactsScreen] Showing loading state');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#07C160" />
        </View>
      </SafeAreaView>
    );
  }

  console.log('[ContactsScreen] Rendering main UI');
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>通讯录</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFriend')}
        >
          <Ionicons name="person-add-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections as any}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => ('id' in item ? item.id : `friend-${index}`)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        stickySectionHeadersEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  menuBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  friendContent: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    color: '#000000',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 68,
  },
});
