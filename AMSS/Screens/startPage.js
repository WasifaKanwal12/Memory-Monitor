import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const StartPage = () => {
  const navigation = useNavigation();

  const navigateToSignIn = (userType) => {
    navigation.navigate('SignIn', { usertype: userType }); 
  };
  

  return (
    <View style={styles.container}>
      <Image
        source={require('../Images/logof2.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Choose your role:</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigateToSignIn('Patient')} style={styles.button}>
          <Text style={styles.buttonText}>Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToSignIn('Doctor')} style={styles.button}>
          <Text style={styles.buttonText}>Doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToSignIn('Caretaker')} style={styles.button}>
          <Text style={styles.buttonText}>Caretaker</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#A3B18A',
  },
  image: {
    width: 500,  
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'light',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'stretch', 
    width: '100%',
  },
  button: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default StartPage;
