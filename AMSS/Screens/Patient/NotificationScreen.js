import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const NotificationScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const patientId = auth.currentUser.uid;

  useEffect(() => {
    const fetchRequestsWithProfilePics = async () => {
      const requestsQuery = query(collection(db, 'requests'), where('patientId', '==', patientId));
      const unsubscribe = onSnapshot(requestsQuery, async (querySnapshot) => {
        const requestsData = [];

        for (const docSnapshot of querySnapshot.docs) {
          const requestData = docSnapshot.data();
          const caretakerDocRef = doc(db, 'users', requestData.caretakerId);
          const caretakerDoc = await getDoc(caretakerDocRef);

          if (caretakerDoc.exists()) {
            const caretakerData = caretakerDoc.data();
            requestsData.push({
              id: docSnapshot.id,
              ...requestData,
              profilePic: caretakerData.profilePic || null,
            });
          } else {
            requestsData.push({
              id: docSnapshot.id,
              ...requestData,
              profilePic: null,
            });
          }
        }

        setRequests(requestsData);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching requests:', error);
        setLoading(false);
      });

      // Clean up the listener on component unmount
      return () => {
        unsubscribe();
      };
    };

    fetchRequestsWithProfilePics();
  }, [db, patientId]);

  const handleResponse = async (requestId, accepted, caretakerName) => {
    try {
      const requestDoc = doc(db, 'requests', requestId);
      const requestSnapshot = await getDoc(requestDoc);
      
      if (accepted) {
        await updateDoc(requestDoc, {
          status: 'Accepted',
        });

        const caretakerPatientsDoc = doc(db, 'caretakerPatients', requestSnapshot.data().caretakerId);
        const caretakerPatientsSnap = await getDoc(caretakerPatientsDoc);
        if (caretakerPatientsSnap.exists()) {
          const { patientList } = caretakerPatientsSnap.data();
          await updateDoc(caretakerPatientsDoc, {
            patientList: [...patientList, patientId],
          });
        } else {
          await setDoc(caretakerPatientsDoc, {
            patientList: [patientId],
          });
        }

        Alert.alert('Request Accepted', `You are now under the care of ${caretakerName}`);
      } else {
        await updateDoc(requestDoc, {
          status: 'Declined',
        });

        Alert.alert('Request Declined', `You have declined the request from ${caretakerName}`);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update the request.');
    }
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestBox}>
      <View style={styles.imageAndText}>
        {item.profilePic ? (
          <Image 
            source={{ uri: item.profilePic }} 
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.profileImage} />
        )}
        <View style={styles.requestContent}>
          <Text style={styles.requestText}>
            {item.status === 'Accepted'
              ? `${item.caretakerName} is now your caretaker`
              : item.status === 'Declined'
              ? `${item.caretakerName}'s request is declined`
              : `${item.caretakerName} wants to be your caretaker`}
          </Text>
        </View>
      </View>
      {item.status === 'Pending' && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleResponse(item.id, true, item.caretakerName)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleResponse(item.id, false, item.caretakerName)}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request</Text>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A', // Background color of the screen
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 20, // Space between title and requests list
  },
  requestBox: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A5A40', // Border color for request box
    marginVertical: 5, // Added margin to ensure spacing between requests
  },
  imageAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  requestContent: {
    flex: 1,
  },
  requestText: {
    fontSize: 16, // Font size for request text
    fontWeight: 'normal', // Removed bold styling
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10, // Ensure space above button group
  },
  acceptButton: {
    backgroundColor: '#228B22', // Green background for accept button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50, // Button with rounded edges
    marginRight: 10,
  },
  declineButton: {
    backgroundColor: '#990000', // Red background for decline button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50, // Button with rounded edges
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold', // Keeping the text bold for buttons
  },
});

export default NotificationScreen;
