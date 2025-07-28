import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  AppState,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      console.log('Background location:', location.coords);
      
    }
  }
});

const GetLiveLocation = ({ route }) => {
  const { patientId, patientName } = route.params;
  const [patientLocation, setPatientLocation] = useState(null);
  const [geofence, setGeofence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isBlinkVisible, setIsBlinkVisible] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  const checkGeofence = (location, fence) => {
    if (!location || !fence) return true;

    const R = 6371e3;
    const φ1 = (location.latitude * Math.PI) / 180;
    const φ2 = (fence.latitude * Math.PI) / 180;
    const Δφ = ((fence.latitude - location.latitude) * Math.PI) / 180;
    const Δλ = ((fence.longitude - location.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= fence.radius;
  };

  const setupNotifications = async () => {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Patient Alert',
        body: `Your patient ${patientName} has left the designated area!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  };

  const startBackgroundTracking = async () => {
    try {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        deferredUpdatesInterval: 5000,
        foregroundService: {
          notificationTitle: 'Patient Location Tracking',
          notificationBody: 'Active',
        },
      });
    } catch (error) {
      console.error('Error starting background tracking:', error);
    }
  };

  const stopBackgroundTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  };

  // Monitor app state
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        stopBackgroundTracking();
      } else if (nextAppState === 'background') {
        startBackgroundTracking();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [appState]);

  // Watch patient location & geofence
  useEffect(() => {
    let blinkInterval = null;

    if (patientLocation && geofence) {
      const inside = checkGeofence(patientLocation, geofence);

      if (!inside && isInsideGeofence) {
        setIsInsideGeofence(false);
        Alert.alert(
          'Geofence Alert',
          `Patient ${patientName} has left the designated area!`
        );
        sendNotification();

        // Start blinking
        blinkInterval = setInterval(() => {
          setIsBlinkVisible((prev) => !prev);
        }, 500);
      } else if (inside && !isInsideGeofence) {
        setIsInsideGeofence(true);
        setIsBlinkVisible(true);
      }
    }

    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [patientLocation, geofence]);

  useEffect(() => {
    setLoading(true);
    setupNotifications();

    const patientLocationRef = doc(db, 'users', patientId);
    const unsubscribeLocation = onSnapshot(patientLocationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.location) {
          setPatientLocation(data.location);
        }
      }
    });

    const geofenceRef = doc(db, 'geofences', patientId);
    const unsubscribeGeofence = onSnapshot(geofenceRef, (docSnap) => {
      if (docSnap.exists()) {
        const latestGeofence = docSnap.data().geofence;
        setGeofence(latestGeofence);
      }
    });

    setLoading(false);

    return () => {
      unsubscribeLocation();
      unsubscribeGeofence();
      stopBackgroundTracking();
    };
  }, [patientId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A5A40" />
        <Text>Loading patient data...</Text>
      </View>
    );
  }

  if (!patientLocation) {
    return (
      <View style={styles.container}>
        <Text>Patient location not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: patientLocation.latitude,
          longitude: patientLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={patientLocation}
          title={`${patientName}'s Location`}
          description={isInsideGeofence ? 'Inside safe area' : 'Outside safe area'}
          pinColor={isInsideGeofence ? '#3A5A40' : '#D22B2B'}
        />
        {geofence && isInsideGeofence && (
          <Circle
            center={geofence}
            radius={geofence.radius}
            fillColor="rgba(100, 200, 100, 0.2)"
            strokeColor="rgba(100, 200, 100, 0.8)"
            strokeWidth={2}
          />
        )}
        {geofence && !isInsideGeofence && isBlinkVisible && (
          <Circle
            center={geofence}
            radius={geofence.radius}
            fillColor="rgba(255, 0, 0, 0.2)"
            strokeColor="rgba(255, 0, 0, 0.8)"
            strokeWidth={2}
          />
        )}
      </MapView>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isInsideGeofence ? 'Inside Safe Area' : 'OUTSIDE SAFE AREA!'}
        </Text>
        {!isInsideGeofence && (
          <Text style={styles.alertText}>
            Alert! {patientName} has left the designated area.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alertText: {
    fontSize: 14,
    color: '#D22B2B',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default GetLiveLocation;
