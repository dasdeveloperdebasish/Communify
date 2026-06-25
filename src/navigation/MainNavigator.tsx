import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityListScreen } from '@/screens/communities/CommunityListScreen';
import { CommunityDetailScreen } from '@/screens/communities/CommunityDetailScreen';
import { CreatePostScreen } from '@/screens/posts/CreatePostScreen';
import { useAuthStore } from '@/store/authStore';
import { colors, typography } from '@/theme';

export type CommunitiesStackParamList = {
  CommunityList: undefined;
  CommunityDetail: { communityId: string; communityName: string };
  CreatePost: { communityId: string; communityName: string };
};

export type MainTabParamList = {
  CommunitiesTab: undefined;
};

const CommunitiesStack = createNativeStackNavigator<CommunitiesStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function CommunitiesStackNavigator() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <CommunitiesStack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: colors.primary,
        headerShadowVisible: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <CommunitiesStack.Screen
        name="CommunityList"
        component={CommunityListScreen}
        options={{
          title: 'Communities',
          headerRight: () => (
            <TouchableOpacity onPress={clearAuth} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <CommunitiesStack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={({ route }) => ({
          title: route.params.communityName,
          headerBackTitle: '',
        })}
      />
      <CommunitiesStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Create Post',
          headerBackTitle: '',
          presentation: 'modal',
        }}
      />
    </CommunitiesStack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen
          name="CommunitiesTab"
          component={CommunitiesStackNavigator}
          options={{
            title: 'Communities',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  logoutButton: {
    marginRight: 4,
    padding: 4,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 4,
    height: 60,
  },
  tabBarLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 4,
  },
});
