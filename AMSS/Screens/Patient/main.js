import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ProfileScreen from '../ProfileScreen';
import NotificationScreen from './NotificationScreen';
import PatientScreen from './PatientHomePage';


import {  useNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

const Tab = createBottomTabNavigator();

export default function PatientMainScreen() {
  const navigationRef = useNavigationContainerRef();
    useEffect(() => {
      // Foreground notifications listener
      const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const { screen, patientId } = response.notification.request.content.data;
  
          if (screen === 'PatientReminderScreen' && patientId) {
            navigationRef.current?.navigate(screen, { patientId });
          }
        }
      );
  
      // Background notifications listener (to receive notifications while the app is in background or closed)
      const backgroundNotificationSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          const { screen, patientId } = notification.request.content.data;
  
          if (screen === 'PatientReminderScreen' && patientId) {
            // If the app is in the background, navigate via the reference
            navigationRef.current?.navigate(screen, { patientId });
          }
        }
      );
  
      return () => {
        notificationSubscription.remove();
        backgroundNotificationSubscription.remove();
      };
    }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'PatientScreen') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-none';
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
      })}
    >
      <Tab.Screen name="PatientScreen" component={PatientScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}
