import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const userId = user?.uid;

  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setName(data.name || '');
        setPhoneNumber(data.phoneNumber || '');
        setEmergencyNumber(data.emergencyNumber || '');
        setProfilePic(data.profilePic || '');
        setUserType(data.userType || '');
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data.');
      console.error(error);
    }
  };

  const handleImageSelect = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setProfilePic(uri);
      }
    });
  };

  const uploadImageToFirebase = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profilePictures/${userId}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    try {
      let profilePicUrl = profilePic;

      // Upload new image if it’s a local file
      if (profilePic && !profilePic.startsWith('https://')) {
        profilePicUrl = await uploadImageToFirebase(profilePic);
      }

      const updatedData = {
        name,
        phoneNumber,
        profilePic: profilePicUrl,
      };

      if (userType === 'Patient') {
        updatedData.emergencyNumber = emergencyNumber;
      }

      await updateDoc(doc(db, 'users', userId), updatedData);

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Name */}
      <View style={styles.field}>
        <Icon name="person" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Phone Number */}
      <View style={styles.field}>
        <Icon name="phone" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={setPhoneNumber}
        />
      </View>

      {/* Emergency Number (Patients Only) */}
      {userType === 'Patient' && (
        <View style={styles.field}>
          <Icon name="phone-in-talk" size={20} color="#555" />
          <TextInput
            style={styles.input}
            placeholder="Emergency Number"
            value={emergencyNumber}
            keyboardType="phone-pad"
            onChangeText={setEmergencyNumber}
          />
        </View>
      )}

      {/* Profile Picture */}
      <TouchableOpacity style={styles.button} onPress={handleImageSelect}>
        <Text style={styles.buttonText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {profilePic && (
        <Image source={{ uri: profilePic }} style={styles.profilePic} />
      )}

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    width: '100%',
    paddingVertical: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 20,
  },
});

export default EditProfileScreen;
