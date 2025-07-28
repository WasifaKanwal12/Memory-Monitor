import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const NotificationScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const caretakerId = auth.currentUser.uid;

  useEffect(() => {
    const fetchRequestsWithProfilePics = async () => {
      try {
        const requestsQuery = query(collection(db, 'requests'), where('caretakerId', '==', caretakerId));
        const unsubscribe = onSnapshot(requestsQuery, async (querySnapshot) => {
          const requestsData = [];

          for (const docSnapshot of querySnapshot.docs) {
            const requestData = docSnapshot.data();
            const patientDocRef = doc(db, 'users', requestData.patientId);
            const patientDoc = await getDoc(patientDocRef);

            if (patientDoc.exists()) {
              const patientData = patientDoc.data();
              requestsData.push({
                id: docSnapshot.id,
                ...requestData,
                profilePic: patientData.profilePic || null,
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
      } catch (error) {
        console.error('Error fetching requests with profile pics:', error);
        setLoading(false);
      }
    };

    fetchRequestsWithProfilePics();
  }, [db, caretakerId]);

  const renderRequest = ({ item }) => (
    <View style={styles.requestBox}>
      {item.profilePic ? (
        <Image source={{ uri: item.profilePic }} style={styles.profileImage} />
      ) : (
        <View style={styles.profileImage} />
      )}
      <View style={styles.requestContent}>
        <Text style={styles.requestText}>{item.patientName}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.ScreenTitle}>Sent Requests </Text>
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
    backgroundColor: '#A3B18A',
  },
  ScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,  // Margin from the top
    marginBottom: 10,  // Space before profile pic
    textAlign: 'center', // Align text to the left
    width: '100%', // Take full width
  },
  requestBox: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A5A40',
    alignItems: 'center',
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
    fontSize: 18,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 15,
    color: '#588157',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationScreen;
