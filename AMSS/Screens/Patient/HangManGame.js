import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';

// Import all hangman images
const hangmanImages = [
  require('../../Images/HangMan/hangman-0.jpg'),
  require('../../Images/HangMan/hangman-1.jpg'),
  require('../../Images/HangMan/hangman-2.jpg'),
  require('../../Images/HangMan/hangman-3.jpg'),
  require('../../Images/HangMan/hangman-4.jpg'),
  require('../../Images/HangMan/hangman-5.jpg'),
  require('../../Images/HangMan/hangman-6.jpg'),
];

// Import victory and lost GIFs
const victoryGif = require('../../Images/HangMan/victory.gif');
const lostGif = require('../../Images/HangMan/lost.gif');

const wordList = [
  { word: "guitar", hint: "A musical instrument with strings." },
  { word: "oxygen", hint: "A colorless, odorless gas essential for life." },
  { word: "mountain", hint: "A large natural elevation of the Earth's surface." },
  { word: "dog", hint: "A common domesticated animal, often kept as a pet." },
  { word: "apple", hint: "A round fruit that is typically red, green, or yellow." },
  { word: "chair", hint: "A piece of furniture designed for sitting." },
  { word: "blue", hint: "A color often associated with the sky or ocean." },
  { word: "cake", hint: "A sweet baked dessert, often frosted." },
  { word: "tree", hint: "A tall plant with a trunk and branches." },
  // Add more words as needed
];

const HangmanGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [hint, setHint] = useState('');
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongGuessCount, setWrongGuessCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const maxGuesses = 6;

  useEffect(() => {
    getRandomWord();
  }, []);

  const getRandomWord = () => {
    const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(word);
    setHint(hint);
    setCorrectLetters([]);
    setWrongGuessCount(0);
    setGameOver(false);
  };

  const handleLetterPress = (letter) => {
    if (currentWord.includes(letter)) {
      setCorrectLetters([...correctLetters, letter]);
    } else {
      setWrongGuessCount(wrongGuessCount + 1);
    }

    if (wrongGuessCount + 1 === maxGuesses) {
      setGameOver(true);
      setIsVictory(false);
    }

    if (currentWord.split('').every((char) => correctLetters.includes(char) || char === letter)) {
      setGameOver(true);
      setIsVictory(true);
    }
  };

  const renderWordDisplay = () => {
    return currentWord.split('').map((letter, index) => (
      <Text key={index} style={styles.letter}>
        {correctLetters.includes(letter) ? letter : '_'}
      </Text>
    ));
  };

  const renderKeyboard = () => {
    return 'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => (
      <TouchableOpacity
        key={letter}
        style={styles.keyboardButton}
        onPress={() => handleLetterPress(letter)}
        disabled={correctLetters.includes(letter) || wrongGuessCount >= maxGuesses}
      >
        <Text style={styles.keyboardButtonText}>{letter}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Image
        source={hangmanImages[wrongGuessCount]} // Use the preloaded image array
        style={styles.hangmanImage}
      />
      <Text style={styles.hintText}>Hint: {hint}</Text>
      <View style={styles.wordDisplay}>{renderWordDisplay()}</View>
      <Text style={styles.guessesText}>
        Incorrect guesses: {wrongGuessCount} / {maxGuesses}
      </Text>
      <View style={styles.keyboard}>{renderKeyboard()}</View>

      <Modal visible={gameOver} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={isVictory ? victoryGif : lostGif} // Use the preloaded GIFs
              style={styles.modalImage}
            />
            <Text style={styles.modalText}>
              {isVictory ? 'You found the word:' : 'The correct word was:'} {currentWord}
            </Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={getRandomWord}>
              <Text style={styles.playAgainButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangmanImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  wordDisplay: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  letter: {
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 5,
  },
  guessesText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  keyboardButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  keyboardButtonText: {
    fontSize: 18,
    color: '#5E63BA',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#5E63BA',
    padding: 10,
    borderRadius: 5,
  },
  playAgainButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default HangmanGame;