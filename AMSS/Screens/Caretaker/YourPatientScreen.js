import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, collection, query, where, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const YourPatientScreen = () => {
  const [yourPatients, setYourPatients] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const caretakerId = auth.currentUser.uid;

  useEffect(() => {
    // Listener for the caretaker's patients
    const caretakerDocRef = doc(db, 'caretakerPatients', caretakerId);
    const unsubscribePatients = onSnapshot(caretakerDocRef, async (caretakerSnap) => {
      if (!caretakerSnap.exists()) {
        // If document doesn't exist, create it with an empty patient list
        await setDoc(caretakerDocRef, {
          caretakerId: caretakerId,
          patientList: [],
        });
      } else {
        // If document exists, fetch the patient list
        const { patientList } = caretakerSnap.data();
        const patientData = await Promise.all(
          patientList.map(async (patientId) => {
            const patientDocRef = doc(db, 'users', patientId);
            const patientSnap = await getDoc(patientDocRef);
            return { id: patientSnap.id, ...patientSnap.data() }; // Include the id in the returned object
          })
        );
        setYourPatients(patientData);
      }
    });
//comment
    return () => {
      unsubscribePatients();
    };
  }, [db, caretakerId]);

  useEffect(() => {
    // Listener for recommendations
    const caretakerDocRef = doc(db, 'caretakerPatients', caretakerId);

    const unsubscribeRecommendations = onSnapshot(
      caretakerDocRef,
      async (caretakerSnap) => {
        const existingPatientIds = caretakerSnap.exists()
          ? caretakerSnap.data().patientList
          : [];

        const patientsQuery = query(
          collection(db, 'users'),
          where('userType', '==', 'Patient')
        );

        const unsubscribePatients = onSnapshot(patientsQuery, (patientsSnap) => {
          const patients = patientsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((patient) => !existingPatientIds.includes(patient.id)); // Exclude patients already in the caretaker's list
          setRecommendations(patients);
        });

        return unsubscribePatients; // Return the actual unsubscribe function from onSnapshot
      }
    );

    return () => {
      unsubscribeRecommendations();
    };
  }, [db, caretakerId]);

  const handleAddPatient = async (patientId, patientName) => {
    try {
      const caretakerDocRef = doc(db, 'users', caretakerId);
      const caretakerSnap = await getDoc(caretakerDocRef);

      if (!caretakerSnap.exists()) {
        throw new Error('Caretaker not found in users collection');
      }

      const caretakerName = caretakerSnap.data().name || 'Unknown';

      // Create a request document
      const requestDocRef = doc(db, 'requests', `${caretakerId}_${patientId}`);
      await setDoc(requestDocRef, {
        caretakerId,
        patientId,
        caretakerName,
        patientName,
        status: 'Pending',
      });

      Alert.alert('Request Sent', `Request sent to ${patientName}`);
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  const renderPatient = ({ item }) => (
    <View style={styles.patientBox}>
      <Text style={styles.patientName}>{item.name}</Text>
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <View style={styles.recommendationBox}>
      <Text style={styles.recommendationName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddPatient(item.id, item.name)}
      >
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Patients</Text>
        <FlatList
          data={yourPatients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendation</Text>
        <FlatList
          data={recommendations}
          renderItem={renderRecommendation}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  patientBox: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A5A40',
  },
  recommendationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A5A40',
  },
  patientName: {
    fontSize: 18,
  },
  recommendationName: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default YourPatientScreen;
