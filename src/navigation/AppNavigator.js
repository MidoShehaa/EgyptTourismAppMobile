import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { useUser } from '../store/UserContext';
import PharaonicBackground from '../components/PharaonicBackground';

// Screens
import PlacesScreen from '../screens/PlacesScreen';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen';
import MapScreen from '../screens/MapScreen';
import ExperiencesScreen from '../screens/ExperiencesScreen';
import CultureScreen from '../screens/CultureScreen';
import HotelsScreen from '../screens/HotelsScreen';
import PlannerScreen from '../screens/PlannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    const { t, settings } = useUser();
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    return (
        <>
            <PharaonicBackground isDark={isDark} />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Explore') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
                        else if (route.name === 'Planner') iconName = focused ? 'calendar' : 'calendar-outline';
                        else if (route.name === 'Experiences') iconName = focused ? 'compass' : 'compass-outline';
                        else if (route.name === 'Hotels') iconName = focused ? 'business' : 'business-outline';

                        return <Ionicons name={iconName} size={size + 2} color={color} />;
                    },
                    tabBarLabel: ({ focused, color }) => {
                        let label = route.name;
                        if (route.name === 'Explore') label = t('tabExplore');
                        else if (route.name === 'Map') label = t('tabMap');
                        else if (route.name === 'Planner') label = t('tabPlanner');
                        else if (route.name === 'Experiences') label = t('tabExperiences');
                        else if (route.name === 'Hotels') label = t('tabHotels');

                        return (
                            <Text 
                                numberOfLines={1} 
                                adjustsFontSizeToFit
                                style={{ 
                                    color, 
                                    fontSize: 11, 
                                    fontWeight: focused ? '900' : '700', 
                                    marginTop: 2,
                                    marginBottom: Platform.OS === 'ios' ? 0 : 6,
                                    textTransform: 'uppercase',
                                    textAlign: 'center',
                                    letterSpacing: 0.5
                                }}
                            >
                                {label}
                            </Text>
                        );
                    },
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 24,
                        left: 16,
                        right: 16,
                        backgroundColor: C.primary,
                        borderColor: C.borderGold,
                        borderWidth: 2,
                        borderRadius: 35,
                        height: Platform.OS === 'ios' ? 88 : 72,
                        paddingTop: 10,
                        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.2,
                        shadowRadius: 15,
                    },
                    tabBarActiveTintColor: C.gold,
                    tabBarInactiveTintColor: isDark ? '#555' : '#888',
                })}
            >
            <Tab.Screen name="Explore" component={PlacesScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Planner" component={PlannerScreen} />
            <Tab.Screen name="Experiences" component={ExperiencesScreen} />
            <Tab.Screen name="Hotels" component={HotelsScreen} />
        </Tab.Navigator>
        </>
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
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
                <Stack.Screen name="Culture" component={CultureScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
