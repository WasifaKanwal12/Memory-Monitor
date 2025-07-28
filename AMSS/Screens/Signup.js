import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { doc, setDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { auth, db, storage } from '../firebase'; // Adjust the path if needed
import * as Location from 'expo-location';
const SignUpScreen = ({ route, navigation }) => {
  const { usertype } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [userType, setUserType] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const handleSignUp = async () => {
    if (!name || !email || !password || !phoneNumber || !profilePic || !userType) {
      Alert.alert('Missing Fields', 'Please fill in all the fields.', [{ text: 'OK' }]);
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Error', 'Password must be at least 6 characters long.', [{ text: 'OK' }]);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      let initialLocation = null;
      if (usertype === 'Patient') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error', 'Location permission is required for patients.');
          return;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert('Error', `Background location permission is required for patients.: ${error.message}`);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        initialLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      const profilePicUrl = await uploadImageToFirebase(profilePic, user.uid);

      const userData = {
        name,
        email,
        phoneNumber,
        userType,
        password,
        profilePic: profilePicUrl,
        emergencyNumber: usertype === 'Patient' ? emergencyNumber : null,
        location: usertype === 'Patient' ? initialLocation : null,
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      Alert.alert('Success', 'Account created successfully!', [{ text: 'OK' }]);
      navigation.navigate('SignIn', { usertype });
    } catch (error) {
      Alert.alert('Error', `An error occurred during sign-up: ${error.message}`, [{ text: 'OK' }]);

    }
  };

  const uploadImageToFirebase = async (imageUri, userId) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storageRef = ref(storage, `profilePictures/${userId}`);
    await uploadBytes(storageRef, blob);

    return await getDownloadURL(storageRef);
  };

  const handleProfilePicSelect = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const fileExtension = response.assets[0].fileName.split('.').pop().toLowerCase();
        if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
          setProfilePic(response.assets[0].uri);
        } else {
          Alert.alert('Invalid File', 'Please select a JPG or PNG image file.', [{ text: 'OK' }]);
        }
        
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../Images/logof2.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Name Field */}
      <View style={styles.field}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#555" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#555"
            style={styles.input}
          />
        </View>
      </View>

      {/* Email Field */}
      <View style={styles.field}>
        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#555" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#555"
            style={styles.input}
          />
        </View>
      </View>

      {/* Password Field */}
      <View style={styles.field}>
        <View style={[styles.inputContainer, styles.passwordContainer]}>
          <Icon name="lock" size={20} color="#555" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholder="Password"
            placeholderTextColor="#555"
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Icon name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Phone Number Field */}
      <View style={styles.field}>
        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#555" />
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="Phone Number"
            placeholderTextColor="#555"
            style={styles.input}
          />
        </View>
      </View>

      {/* Emergency Number (if applicable) */}
      {usertype === 'Patient' && (
        <View style={styles.field}>
          <View style={styles.inputContainer}>
            <Icon name="phone-in-talk" size={20} color="#555" />
            <TextInput
              value={emergencyNumber}
              onChangeText={setEmergencyNumber}
              keyboardType="phone-pad"
              placeholder="Emergency Number"
              placeholderTextColor="#555"
              style={styles.input}
            />
          </View>
        </View>
      )}

      {/* User Type Picker */}
      <View style={styles.field}>
        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={setUserType}
        >
          <Picker.Item label="Select User Type..." value="" />
          <Picker.Item label="Doctor" value="Doctor" />
          <Picker.Item label="Caretaker" value="Caretaker" />
          <Picker.Item label="Patient" value="Patient" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleProfilePicSelect}>
        <Text style={styles.buttonText}>Select Profile Picture</Text>
      </TouchableOpacity>

      {profilePic && <Image source={{ uri: profilePic }} style={styles.profilePic} />}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.signInText}>
        Already have an account?{' '}
        <Text style={styles.signInLink} onPress={() => navigation.navigate('SignIn', { usertype })}>
          Sign In
        </Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#A3B18A', },
  image: {
    width: 150,
    height: 100,
    marginBottom: 10,
    alignSelf: 'center',
  },
  field: { marginBottom: 15 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingVertical: 5,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  passwordContainer: {
    justifyContent: 'space-between',
  },
  passwordInput: {
    marginRight: 10,
  },
  picker: { borderBottomWidth: 1, borderBottomColor: '#ddd', color: '#333' },
  button: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  profilePic: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 20 },
  signInText: { textAlign: 'center', fontSize: 16, color: '#333' },
  signInLink: { color: '#3A5A40', fontWeight: 'bold' },
});

export default SignUpScreen;
