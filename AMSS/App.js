import React, { useEffect } from 'react';
import { StyleSheet, StatusBar, Platform, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

import StartPage from './Screens/startPage';
import SplashScreen from './Screens/splashScreen';
import SignInScreen from './Screens/Signin';
import SignUpScreen from './Screens/Signup';
import DoctorScreen from './Screens/Doctor/DoctorHomePage';
import CaretakerMainScreen from './Screens/Caretaker/main';
import PatientMainScreen from './Screens/Patient/main';
import PatientList from './Screens/Caretaker/PatientList';
import AddImageScreen from './Screens/Caretaker/AddImageScreen';
import MemoryBoxScreen from './Screens/Patient/MemoryBox';
import PatientReminderScreen from './Screens/Patient/PatientReminderScreen';
import CaretakerReminderScreen from './Screens/Caretaker/CaretakerReminderScreen';
import EditProfileScreen from './Screens/EditProfileScreen';
import SeeLocationScreen from './Screens/Patient/SeeLocationScreen';
import SetGeofenceScreen from './Screens/Caretaker/SetGeofenceScreen';
import ReachOutScreen from './Screens/Patient/Reachout';
import GetLiveLocation from './Screens/Caretaker/GetLiveLocation';
import GamesHomeScreen from './Screens/Patient/GamesScreen';
import HangmanGame from './Screens/Patient/HangManGame';
import FlipCardGame from './Screens/Patient/FlipCardGame';

const Stack = createStackNavigator();

export default function App() {
  // Setting up notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    };
    initializeNotifications();
  }, []);

  // Request permission for notifications
  const setupNotifications = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const newStatus = await Notifications.requestPermissionsAsync();
      if (newStatus.status !== 'granted') {
        Alert.alert('Error', 'Failed to get notification permissions');
      }
    }
  };

  // Request notification permissions when the component mounts
  useEffect(() => {
    setupNotifications();
  }, []);

  

  return (
    <View style={styles.container}>
      {/* StatusBar customization */}
      <StatusBar
        translucent
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      <NavigationContainer >
        <Stack.Navigator
          
          
          initialRouteName="Splash"
          screenOptions={{
            cardStyle: { backgroundColor: '#A3B18A' },
            headerShown: true,
            headerStyle: {
              backgroundColor: '#588157', 
              elevation: 0, 
              shadowOpacity: 0,
              height: 50, 
            },
            headerTintColor: 'black', 
            headerTitleAlign: 'left', 
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Home" component={StartPage} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="DoctorScreen" component={DoctorScreen} options={{ title: 'Detect Disease',  }} />
          <Stack.Screen name="CaretakerMainScreen" component={CaretakerMainScreen}   options={{ title: 'Caretaker',  }}/>
          <Stack.Screen name="PatientMainScreen" component={PatientMainScreen}  options={{ title: 'Patient',  }} />
          <Stack.Screen name="PatientList" component={PatientList} />
          <Stack.Screen name="AddImageScreen" component={AddImageScreen} options={{ title: 'Images',  }} />
          <Stack.Screen name="MemoryBox" component={MemoryBoxScreen} />
          <Stack.Screen name="CaretakerReminderScreen" component={CaretakerReminderScreen} options={{ title: 'Reminders',  }} />
          <Stack.Screen name="PatientReminderScreen" component={PatientReminderScreen} options={{ title: 'Reminders',  }}/>
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{
              title: 'Edit Profile', 
            }}/>
           <Stack.Screen name="SeeLocationScreen" component={SeeLocationScreen} options={{ title: 'Your Location',  }}/>
           <Stack.Screen name="SetGeofenceScreen" component={SetGeofenceScreen} options={{ title: 'Set Geofence',  }}/>
           <Stack.Screen name="GamesScreen" component={GamesHomeScreen} options={{ title: 'Mind Games',  }}/>
           <Stack.Screen name="ReachOutScreen" component={ReachOutScreen} options={{ title: 'Reach Out',  }}/>
           <Stack.Screen name="GetLiveLocation" component={GetLiveLocation} options={{ title: 'Live Location',  }}/>
           <Stack.Screen name="FlipCardGame" component={FlipCardGame} options={{ title: 'Flip Card',  }}/>
           <Stack.Screen name="HangmanGame" component={HangmanGame} options={{ title: 'Hangman Game',  }}/>
           
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Add padding for Android to avoid overlap
    backgroundColor: '#588157', 
  },
});
