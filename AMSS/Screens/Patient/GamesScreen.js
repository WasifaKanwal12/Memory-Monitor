import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';

// Get screen width for responsive layout
const screenWidth = Dimensions.get('window').width;

const GameHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* First row with only one game */}
      <TouchableOpacity
        style={styles.gameContainer}
        onPress={() => navigation.navigate('FlipCardGame')}
      >
        <ImageBackground
          source={require('../../Images/flipcard.png')} // Correct the path to your image
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.gameNameContainer}>
            <Text style={styles.gameName}>Flip Card Game</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Second row with only one game */}
      <TouchableOpacity
        style={styles.gameContainer}
        onPress={() => navigation.navigate('HangmanGame')}
      >
        <ImageBackground
          source={require('../../Images/hangman.jpg')} // Correct the path to your image
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.gameNameContainer}>
            <Text style={styles.gameName}>Hangman Game</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
  },
  gameContainer: {
    width: '100%', // Ensure each game container takes the full width of the screen
    marginBottom: 20, // Space between game containers
    borderRadius: 10,
    overflow: 'hidden', // Ensures the image doesn't overflow the rounded corners
  },
  imageBackground: {
    width: '100%',
    height: 150, // Set the height of the image to 1/3 of the container's height
    justifyContent: 'flex-end', // Push the text to the bottom of the image
  },
  gameNameContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background to make text readable
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default GameHomeScreen;
