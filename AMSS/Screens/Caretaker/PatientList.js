import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, getDoc } from 'firebase/firestore';

const PatientList = ({ navigation, route }) => {
  const { screenText } = route.params; // Receive `screenText` from the previous screen
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();  
  const db = getFirestore();
  const caretakerId = auth.currentUser?.uid; 

  // Fetch patient's list
  useEffect(() => {
    if (!caretakerId) {
      Alert.alert('Error', 'No caretaker logged in');
      setLoading(false);
      return;
    }

    // Fetch the caretaker's patient list from Firestore
    const caretakerDocRef = doc(db, 'caretakerPatients', caretakerId);

    // Listener for caretaker's patient list
    const unsubscribePatients = onSnapshot(caretakerDocRef, async (caretakerSnap) => {
      if (!caretakerSnap.exists()) {
        // If document doesn't exist, show an alert that no patients have been added
        Alert.alert('No Patients', 'No patients have been added to this caretaker.');
        setLoading(false);
      } else {
        // If document exists, fetch the patient list
        const { patientList } = caretakerSnap.data();
        if (patientList.length === 0) {
          Alert.alert('No Patients', 'No patients have been added to this caretaker.');
          setLoading(false);
        } else {
          const patientData = await Promise.all(
            patientList.map(async (patientId) => {
              const patientDocRef = doc(db, 'users', patientId);
              const patientSnap = await getDoc(patientDocRef);
              const patientData = patientSnap.exists() ? patientSnap.data() : null;
              return { id: patientSnap.id, ...patientData };
            })
          );
          setPatients(patientData);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribePatients();
    };
  }, [db, caretakerId]);

  const renderPatient = ({ item }) => (
    <TouchableOpacity
      style={styles.patientBox}
      onPress={() => {
        // Navigate based on the `screenText`
        switch (screenText) {
          case ' Add Reminders ':
            navigation.navigate('CaretakerReminderScreen', { patientId: item.id });
            break;
          case '    Add  Pictures   ':
            navigation.navigate('AddImageScreen', { patientId: item.id });
            break;
          case ' Set GeoFence Area':
            navigation.navigate('SetGeofenceScreen', { patientId: item.id });
            break;
          case '    Get  Location   ':
            navigation.navigate('GetLiveLocation', { patientId: item.id ,patientName: item.name });
            break;
          default:
            navigation.navigate('PatientList'); // Fallback to PatientList
        }
      }}
    >
      <View style={styles.patientRow}>
        {/* Profile Picture */}
        {item.profilePic ? (
          <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
        ) : (
          <View style={styles.profilePicPlaceholder} />
        )}
        {/* Patient Name */}
        <Text style={styles.patientText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Patients</Text>
      {patients.length > 0 ? (
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text>No patients found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  patientBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 15,
    borderColor: '#3A5A40',
    borderWidth: 1,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center', // Align items in the center
  },
  profilePic: {
    width: 50, // Size of the profile picture
    height: 50,
    borderRadius: 25, // Make it circular
    marginRight: 15, // Space between the profile picture and name
  },
  profilePicPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd', // Placeholder color
    marginRight: 15,
  },
  patientText: {
    color: 'Black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PatientList;
