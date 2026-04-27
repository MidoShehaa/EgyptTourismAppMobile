import React from 'react';
import { Text, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { useUser } from '../store/UserContext';

import PlacesScreen from '../screens/PlacesScreen';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen';
import MapScreen from '../screens/MapScreen';
import HotelsScreen from '../screens/HotelsScreen';
import PlannerScreen from '../screens/PlannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RidesScreen from '../screens/RidesScreen';
import AdminPanel from '../screens/AdminPanel';
import AdminAuthScreen from '../screens/AdminAuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    const { t, settings } = useUser();
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const TABS = [
        { name: 'Explore',  icon: 'home',     iconO: 'home-outline',     label: t('tabExplore') },
        { name: 'Map',      icon: 'map',       iconO: 'map-outline',      label: t('tabMap') },
        { name: 'Planner',  icon: 'calendar',  iconO: 'calendar-outline', label: t('tabPlanner') },
        { name: 'Rides',    icon: 'car',       iconO: 'car-outline',      label: t('tabRides') },
        { name: 'Hotels',   icon: 'business',  iconO: 'business-outline', label: t('tabHotels') },
    ];

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const tab = TABS.find(t => t.name === route.name);
                return {
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? tab?.icon : tab?.iconO} size={size + 2} color={color} />
                    ),
                    tabBarLabel: ({ focused, color }) => (
                        <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: focused ? color : 'transparent', marginTop: 4 }} />
                    ),

                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 30,
                        left: 24,
                        right: 24,
                        backgroundColor: isDark ? '#1A1A1A' : '#ffffff',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderWidth: 1,
                        borderRadius: 32,
                        height: 70,
                        paddingBottom: 0,
                        elevation: 15,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: isDark ? 0.5 : 0.1,
                        shadowRadius: 20,
                    },
                    tabBarActiveTintColor: C.primary,
                    tabBarInactiveTintColor: isDark ? '#555' : '#888',
                };

            }}
        >
            <Tab.Screen name="Explore"  component={PlacesScreen} />
            <Tab.Screen name="Map"      component={MapScreen} />
            <Tab.Screen name="Planner"  component={PlannerScreen} />
            <Tab.Screen name="Rides"    component={RidesScreen} />
            <Tab.Screen name="Hotels"   component={HotelsScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { settings } = useUser();
    const hasSeenOnboarding = settings?.hasSeenOnboarding === true;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={hasSeenOnboarding ? 'MainTabs' : 'Onboarding'}
            >
                <Stack.Screen name="Onboarding"   component={OnboardingScreen} />
                <Stack.Screen name="MainTabs"     component={TabNavigator} />
                <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
                <Stack.Screen name="Profile"      component={ProfileScreen} />
                <Stack.Screen name="HotelsCity"   component={HotelsScreen} />
                <Stack.Screen name="AdminAuth"    component={AdminAuthScreen} />
                <Stack.Screen name="AdminPanel"   component={AdminPanel} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
