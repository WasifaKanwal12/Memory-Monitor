import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const CaretakerScreen = ({ navigation }) => {

  // Mock data for the boxes
  const boxData = [
    { id: '1', image: require('../../Images/remin.png'), text: ' Add Reminders ' , navigateTo: 'PatientList' },
    { id: '2', image: require('../../Images/img.png'),   text: '    Add  Pictures   ', navigateTo: 'PatientList' },
    { id: '4', image: require('../../Images/geofence.jpg'),    text: ' Set GeoFence Area', navigateTo: 'PatientList' },
    { id: '3', image: require('../../Images/loc.png'),   text: '    Get  Location   ', navigateTo: 'PatientList' },

  ];

  const renderBox = (item) => (
    <TouchableOpacity 
      style={styles.box} 
      onPress={() => item.navigateTo ? navigation.navigate(item.navigateTo, { screenText: item.text }) : null}
    >
      {/* LinearGradient background for the box */}
      <LinearGradient 
        colors={['#344E41', '#3A5A40', '#588157', '#A3B18A', '#DAD7CD']} // Corrected gradient colors
        style={styles.gradientBox}
      >
        <Image source={item.image} style={styles.image} />
        <Text style={styles.boxText}>{item.text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleBox}>
        <Text style={styles.titleText}>Caretaker Home</Text>
      </View>

      {/* Boxes Section */}
      <View style={styles.boxContainer}>
        <View style={styles.row}>
          {boxData.slice(0, 2).map((item) => renderBox(item))}
        </View>
        <View style={styles.row}>
          {boxData.slice(2, 4).map((item) => renderBox(item))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#A3B18A', // Background color for the entire screen
  },
  titleBox: {
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20, // Add margin below the title
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: 'black', // Make the title text black
    fontSize: 20,
    fontWeight: 'bold', // Make the title bold
  },
  boxContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
  },
  box: {
    width: '48%', // Set a consistent width for the box
    height: 150,  // Set a consistent height for the box
    marginVertical: 10, // Add vertical margin between boxes
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBox: {
    flex: 1, // Ensure the gradient covers the whole box area
    borderRadius: 10, // Match the border radius of the box
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
    color: 'black', // Make the box text black
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CaretakerScreen;
