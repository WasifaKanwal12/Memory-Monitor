import React, { useState } from 'react';
import * as Location from 'expo-location';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Text,
} from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc ,setDoc} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SignInScreen = ({ route }) => {
  const navigation = useNavigation();
  const { usertype } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
  
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userType = userData.userType;
  
        // Update location for Patients
        if (userType === 'Patient') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const currentLocation = await Location.getCurrentPositionAsync({});
            const coords = {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            };
  
            await setDoc(userRef, { location: coords }, { merge: true });
          } else {
            Alert.alert('Permission Denied', 'Location permission is required to update your location.');
          }
        }
  
        // Navigate to correct screen based on userType
        if (userType === 'Patient') {
          navigation.navigate('PatientMainScreen');
        } else if (userType === 'Doctor') {
          navigation.navigate('DoctorScreen');
        } else if (userType === 'Caretaker') {
          navigation.navigate('CaretakerMainScreen');
        } else {
          Alert.alert('Error', 'Unknown user type');
        }
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
      console.error('Sign-in error:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Image
        source={require('../Images/logof2.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.inputContainer}>
        <View style={styles.textInputWrapper}>
          <Icon name="email" size={20} color="#555" style={styles.icon} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#555"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.textInputWrapper}>
          <Icon name="lock" size={20} color="#555" style={styles.icon} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#555"
            secureTextEntry={!isPasswordVisible}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={styles.signUpText}>
        Don't have an account?{' '}
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate('SignUp', { usertype })}
        >
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#A3B18A',
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 5,
    marginBottom:30,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  signInButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  signUpLink: {
    color: '#3A5A40',
    fontWeight: 'bold',
  },
});

export default SignInScreen;
