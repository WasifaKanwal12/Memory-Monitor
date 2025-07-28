import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; // For icons

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          if (data.profilePic) {
            await Image.prefetch(data.profilePic);  // Prefetch image if exists
            setImageLoaded(true);
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [db, user.uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Title at Top */}
      <Text style={styles.profileTitle}>Profile</Text>

      {/* Profile Picture */}
      <Image
        source={{ uri: userData?.profilePic || 'https://via.placeholder.com/100' }}
        style={styles.profilePic}
      />

      {/* Name and Type */}
      <Text style={styles.userName}>{userData?.name || 'Anonymous'}</Text>
      <Text style={styles.userType}>{userData?.userType || 'Unknown Type'}</Text>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => navigation.navigate('EditProfileScreen')}
      >
        <Ionicons name="create" size={20} color="black" />
        <Text style={styles.editProfileText}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={20} color="black" />
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          auth.signOut().then(() => {
            navigation.navigate('Home');
          });
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',  // Align items to the start (top)
    backgroundColor: '#A3B18A',
    padding: 20,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,  // Margin from the top
    marginBottom: 50,  // Space before profile pic
    textAlign: 'center', // Align text to the left
    width: '100%', // Take full width
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userType: {
    fontSize: 18,
    color: '#777',
    marginBottom: 30,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'flex-start', 
  },
  editProfileText: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
    marginRight:160,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'flex-start',
  },
  logoutText: {
    fontSize: 18,
    color: 'red',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A3B18A',
  },
});

export default ProfileScreen;
