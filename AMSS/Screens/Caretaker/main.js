import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ProfileScreen from '../ProfileScreen';
import NotificationScreen from '../Caretaker/NotificationScreen';
import CaretakerScreen from './CaretakerHomePage';
import YourPatientScreen from './YourPatientScreen'; // Add this import

const Tab = createBottomTabNavigator();

export default function CaretakerMainScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'CaretakerScreen') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-none';
          } else if (route.name === 'yourPatient') {
            iconName = focused ? 'group' : 'group-add';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff', // White color for active icon/text
        tabBarInactiveTintColor: 'gray', // Gray color for inactive icon/text
        tabBarStyle: {
          backgroundColor: '#588157', // Bottom tab bar color
          borderTopWidth: 0, // Removes the border at the top of the tab bar
        },
        headerShown: false, // Hide header for the bottom tab navigator
        
        headerStyle: {
          backgroundColor:'#A3B18A'

        },
        headerTintColor: '#fff', // White color for header text
      })}
    >
      <Tab.Screen name="CaretakerScreen" component={CaretakerScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="yourPatient" component={YourPatientScreen} options={{ title: 'Patients' }} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}
