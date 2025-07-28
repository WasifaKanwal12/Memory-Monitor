import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const PatientScreen = () => {
  const navigation = useNavigation();
  const [emergencyNumber, setEmergencyNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const patientId = auth.currentUser?.uid;

  const boxData = [
    { id: '1', image: require('../../Images/img.png'), text:      ' Memory Box  ', navigateTo: 'MemoryBox' },
    { id: '2', image: require('../../Images/loc.png'), text:      'Your Location', navigateTo: 'SeeLocationScreen' },
    { id: '3', image: require('../../Images/remin.png'), text:    '  Reminders  ', navigateTo: 'PatientReminderScreen', params: { patientId } },
    { id: '4', image: require('../../Images/reachout.jpg'), text: '  Reach  Out  ',navigateTo: 'ReachOutScreen' },
    { id: '5', image: require('../../Images/games.png'), text:    '  Mind Games ', navigateTo: 'GamesScreen' },
  ];

  useEffect(() => {
    const fetchEmergencyNumber = async () => {
      try {
        const userDocRef = doc(db, 'users', patientId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setEmergencyNumber(userDoc.data().emergencyNumber || 'Not Available');
        } else {
          setEmergencyNumber('Not Available');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch emergency number.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyNumber();
  }, [patientId]);

  const renderBox = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.box}
      onPress={() => item.navigateTo && navigation.navigate(item.navigateTo, item.params)}
    >
      <LinearGradient
        colors={['#344E41', '#3A5A40', '#588157', '#A3B18A', '#DAD7CD']}
        style={styles.gradientBox}
      >
        <Image source={item.image} style={styles.image} />
        <Text style={styles.boxText}>{item.text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleEmergencyCall = async () => {
    if (emergencyNumber && emergencyNumber !== 'Not Available') {
      const phoneUrl = `tel:${emergencyNumber}`;
      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Calling is not supported on this device.');
      }
    } else {
      Alert.alert('Emergency Number Not Available');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Text style={styles.titleText}>Patient Home</Text>
      </View>

      <View style={styles.boxContainer}>
        <View style={styles.row}>
          {boxData.slice(0, 2).map((item) => renderBox(item))}
        </View>
        <View style={styles.row}>
          {boxData.slice(2, 4).map((item) => renderBox(item))}
        </View>
        <View style={styles.row}>
          {boxData.slice(4, 5).map((item) => renderBox(item))}
          <View style={styles.emptyBox} />
        </View>
      </View>

      <View style={styles.emergencyContainer}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
        >
          <Text style={styles.emergencyText}>
            {loading ? <ActivityIndicator color="#fff" /> : `Emergency Dial: ${emergencyNumber}`}
          </Text>
        </TouchableOpacity>
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
  titleBox: {
    paddingVertical: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  boxContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  box: {
    width: '48%',
    height: 150,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '1%',
  },
  emptyBox: {
    width: '48%',
    height: 150,
  },
  gradientBox: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  boxText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
  emergencyContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  emergencyButton: {
    backgroundColor: '#990000',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PatientScreen;
