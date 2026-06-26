import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommunityListScreen } from '@/screens/communities/CommunityListScreen';
import { CommunityDetailScreen } from '@/screens/communities/CommunityDetailScreen';
import { CreatePostScreen } from '@/screens/posts/CreatePostScreen';
import { useAuth } from '@/hooks/useAuth';
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
  const { logout } = useAuth();

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
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
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
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </CommunitiesStack.Navigator>
  );
}

function TabBar() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            { paddingBottom: bottomPadding, height: 52 + bottomPadding },
          ],
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
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export function MainNavigator() {
  return <TabBar />;
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
    paddingTop: 8,
  },
  tabBarLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: Platform.OS === 'android' ? 4 : 0,
  },
});
