import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useUser } from '../store/UserContext';

// Screens
import PlacesScreen from '../screens/PlacesScreen';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen';
import MapScreen from '../screens/MapScreen';
import ExperiencesScreen from '../screens/ExperiencesScreen';
import CultureScreen from '../screens/CultureScreen';
import HotelsScreen from '../screens/HotelsScreen';
import PlannerScreen from '../screens/PlannerScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    const { t } = useUser();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Explore') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Planner') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Experiences') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Hotels') {
                        iconName = focused ? 'business' : 'business-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabel: ({ focused, color }) => {
                    let label = route.name;
                    if (route.name === 'Explore') label = t('tabExplore');
                    else if (route.name === 'Map') label = t('tabMap');
                    else if (route.name === 'Planner') label = t('tabPlanner');
                    else if (route.name === 'Experiences') label = t('tabExperiences');
                    else if (route.name === 'Hotels') label = t('tabHotels');

                    return <Text style={{ color, fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>{label}</Text>;
                },
                tabBarStyle: {
                    backgroundColor: COLORS.bgCard,
                    borderTopColor: COLORS.borderSubtle,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
            })}
        >
            <Tab.Screen name="Explore" component={PlacesScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Planner" component={PlannerScreen} />
            <Tab.Screen name="Experiences" component={ExperiencesScreen} />
            <Tab.Screen name="Hotels" component={HotelsScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
