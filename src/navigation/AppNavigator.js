import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Cpu, Bell, User } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddDeviceScreen from '../screens/AddDeviceScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DeviceDetailsScreen from '../screens/DeviceDetailsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let icon;
          if (route.name === 'Home') icon = <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Devices') icon = <Cpu size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Alerts') icon = <Bell size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Profile') icon = <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          return icon;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Devices" component={DevicesScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Main" component={MainTabs} />

      <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
      <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 10,
    height: 85,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: Colors.white,
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default AppNavigator;
