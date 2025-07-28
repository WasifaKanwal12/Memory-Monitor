import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const GOOGLE_MAPS_API_KEY = "AIzaSyBj5xRqTqpzGrOXSxkFfwJULNwQb2yRA3E";

const SetGeofenceScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [region, setRegion] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [geofenceCenter, setGeofenceCenter] = useState(null);
  const [geofenceRadius, setGeofenceRadius] = useState(100);
  const auth = getAuth();
  const db = getFirestore();
  const caretakerId = auth.currentUser?.uid;

  // Fetch existing geofence on mount
  useEffect(() => {
    const fetchExistingGeofence = async () => {
      try {
        const geofenceDocRef = doc(db, 'geofences', patientId);
        const docSnap = await getDoc(geofenceDocRef);

        if (docSnap.exists()) {
          const { geofence } = docSnap.data();
          setGeofenceCenter({
            latitude: geofence.latitude,
            longitude: geofence.longitude,
          });

          setGeofenceRadius(geofence.radius);
          setRegion({
            latitude: geofence.latitude,
            longitude: geofence.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      } catch (error) {
        console.error('Error fetching existing geofence:', error);
      }
    };

    fetchExistingGeofence();
  }, []);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text)}&key=${GOOGLE_MAPS_API_KEY}&components=country:pk`;

      const response = await fetch(autocompleteUrl);
      const data = await response.json();

      if (data.status === "OK") {
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionSelect = async (placeId) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.result.geometry.location;
        setSearchText(data.result.name);
        setShowPredictions(false);
        Keyboard.dismiss();

        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });

        setGeofenceCenter({ latitude: location.lat, longitude: location.lng });
      }
    } catch (error) {
      console.error('Place details error:', error);
      Alert.alert('Error', 'Failed to get place details.');
    }
  };

  const handleRadiusChange = (value) => {
    setGeofenceRadius(value);
  };

  const handleSaveGeofence = async () => {
    if (!geofenceCenter) {
      Alert.alert('Error', 'Please search for and select a location.');
      return;
    }

    const geofenceData = {
      latitude: geofenceCenter.latitude,
      longitude: geofenceCenter.longitude,
      radius: parseFloat(geofenceRadius),
      timestamp: new Date(),
    };

    if (!caretakerId || !patientId) {
      Alert.alert('Error', 'Caretaker or Patient ID not found.');
      return;
    }

    const geofenceDocRef = doc(db, 'geofences', patientId);

    try {
      await setDoc(geofenceDocRef, {
        caretakerId: caretakerId,
        patientId: patientId,
        geofence: geofenceData,
      }, { merge: true });

      Alert.alert('Success', 'Geofence saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving geofence:', error);
      Alert.alert('Error', 'Failed to save geofence. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter location"
          value={searchText}
          onChangeText={handleSearch}
          onSubmitEditing={() => handleSearch(searchText)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch(searchText)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {showPredictions && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() => handlePredictionSelect(item.place_id)}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {region ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          region={region}
        >
          {geofenceCenter && (
            <>
              <Marker coordinate={geofenceCenter} title="Geofence Center" />
              {geofenceRadius > 0 && (
                <Circle
                  center={geofenceCenter}
                  radius={parseFloat(geofenceRadius)}
                  fillColor="rgba(100, 100, 200, 0.2)"
                  strokeColor="rgba(100, 100, 200, 0.5)"
                />
              )}
            </>
          )}
        </MapView>
      ) : (
        <View style={styles.initialMessageContainer}>
          <Text style={styles.initialMessageText}>
            Enter a location in the search bar to set the geofence.
          </Text>
        </View>
      )}

      {geofenceCenter && (
        <View style={styles.radiusContainer}>
          <Text style={styles.label}>
            Set Geofence Radius (meters): {geofenceRadius}
          </Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => handleRadiusChange(Math.max(50, geofenceRadius - 50))}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderThumb,
                  {
                    left: `${((geofenceRadius - 50) / 1950) * 100}%`,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => handleRadiusChange(Math.min(2000, geofenceRadius + 50))}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveGeofence}>
        <Text style={styles.saveButtonText}>Save Geofence</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#3A5A40',
    padding: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  predictionsContainer: {
    backgroundColor: 'white',
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 10,
    zIndex: 1000,
  },
  predictionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  map: {
    flex: 1,
  },
  initialMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  initialMessageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  radiusContainer: {
    padding: 20,
    backgroundColor: '#f4f4f4',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderButton: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#3A5A40',
    borderRadius: 10,
    position: 'absolute',
  },
  saveButton: {
    backgroundColor: '#3A5A40',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetGeofenceScreen;
