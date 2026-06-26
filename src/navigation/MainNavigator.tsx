import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native';
import { CommunityListScreen } from '@/screens/communities/CommunityListScreen';
import { CommunityDetailScreen } from '@/screens/communities/CommunityDetailScreen';
import { CreatePostScreen } from '@/screens/posts/CreatePostScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { colors, typography } from '@/theme';

export type CommunitiesStackParamList = {
  CommunityList: undefined;
  CommunityDetail: { communityId: string; communityName: string };
  CreatePost: { communityId: string; communityName: string };
};

export type MainTabParamList = {
  CommunitiesTab: undefined;
  ProfileTab: undefined;
};

const CommunitiesStack = createNativeStackNavigator<CommunitiesStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function getTabBarVisibility(route: RouteProp<MainTabParamList, 'CommunitiesTab'>): boolean {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'CommunityList';
  return routeName === 'CommunityList';
}

function TabBarButton(props: any) {
  return (
    <Pressable
      {...props}
      android_ripple={null}
      style={({ pressed }) => [
        props.style,
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    />
  );
}

function CommunitiesStackNavigator() {
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
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarHideOnKeyboard: true,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      >
        <Tab.Screen
          name="CommunitiesTab"
          component={CommunitiesStackNavigator}
          options={({ route }) => ({
            title: 'Communities',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
            tabBarStyle: getTabBarVisibility(route)
              ? [styles.tabBar, { paddingBottom: bottomPadding, height: 52 + bottomPadding }]
              : { display: 'none' },
          })}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
            tabBarStyle: [
              styles.tabBar,
              { paddingBottom: bottomPadding, height: 52 + bottomPadding },
            ],
            headerShown: true,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerShadowVisible: true,
            headerTitle: 'Profile',
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
