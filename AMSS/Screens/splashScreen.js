import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Set a timer to move to the next screen after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 5000);

    // Clear the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../Images/logof2.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Memory Monitor</Text>
      <Text style={styles.subtitle}>Alzheimer's Monitoring and Support System</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3B18A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200, // Adjust width for a clean size
    height: 200, // Maintain aspect ratio
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SplashScreen;