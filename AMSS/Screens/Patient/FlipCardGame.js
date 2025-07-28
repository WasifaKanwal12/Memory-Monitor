import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';

const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];

function shuffleCards(array) {
  const length = array.length;
  for (let i = length; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i);
    const currentIndex = i - 1;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}

export default function FlipCardGame() {
  const [cards, setCards] = useState(() => shuffleCards([...emojis, ...emojis]));
  const [openCards, setOpenCards] = useState([]);
  const [clearedCards, setClearedCards] = useState({});
  const [shouldDisableAllCards, setShouldDisableAllCards] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bestScore, setBestScore] = useState(Number.POSITIVE_INFINITY);
  const timeout = useRef(null);

  const disable = () => {
    setShouldDisableAllCards(true);
  };
  const enable = () => {
    setShouldDisableAllCards(false);
  };

  const checkCompletion = () => {
    if (Object.keys(clearedCards).length === emojis.length) {
      setShowModal(true);
      const highScore = Math.min(moves, bestScore);
      setBestScore(highScore);
    }
  };

  const evaluate = () => {
    const [first, second] = openCards;
    enable();
    if (cards[first] === cards[second]) {
      setClearedCards((prev) => ({ ...prev, [cards[first]]: true }));
      setOpenCards([]);
      return;
    }
    timeout.current = setTimeout(() => {
      setOpenCards([]);
    }, 100); // Delay before flipping back
  };

  const handleCardClick = (index) => {
    if (openCards.length === 1) {
      setOpenCards((prev) => [...prev, index]);
      setMoves((prev) => prev + 1);
      disable();
    } else {
      clearTimeout(timeout.current);
      setOpenCards([index]);
    }
  };

  useEffect(() => {
    let timeout = null;
    if (openCards.length === 2) {
      timeout = setTimeout(evaluate, 300);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [openCards]);

  useEffect(() => {
    checkCompletion();
  }, [clearedCards]);

  const checkIsFlipped = (index) => {
    return openCards.includes(index);
  };

  const checkIsInactive = (card) => {
    return Boolean(clearedCards[card]);
  };

  const handleRestart = () => {
    setClearedCards({});
    setOpenCards([]);
    setShowModal(false);
    setMoves(0);
    setShouldDisableAllCards(false);
    setCards(shuffleCards([...emojis, ...emojis]));
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Play the Flip card game</Text>
        <Text style={styles.subHeaderText}>
          Select two cards with the same emoji consecutively to make them vanish
        </Text>
      </View>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              checkIsFlipped(index) && styles.flipped,
              checkIsInactive(card) && styles.inactive,
            ]}
            disabled={shouldDisableAllCards || checkIsInactive(card)}
            onPress={() => handleCardClick(index)}
          >
            {/* Front side with placeholder */}
            <View style={styles.cardFront}>
              {!checkIsFlipped(index) && (
                <Text style={styles.cardText}>🃏</Text> // Placeholder text
              )}
            </View>
            {/* Back side with emoji */}
            <View style={styles.cardBack}>
              {checkIsFlipped(index) && (
                <Text style={styles.cardText}>{card}</Text> // Emoji text
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.score}>
          <Text style={styles.bold}>Moves:</Text> {moves}
        </Text>
        {bestScore !== Number.POSITIVE_INFINITY && (
          <Text style={styles.highScore}>
            <Text style={styles.bold}>Best Score:</Text> {bestScore}
          </Text>
        )}
      </View>

      {/* Restart Button */}
      <Button title="Restart" onPress={handleRestart} color="#3A5A40" />

      {/* Modal for Game Completion */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hurray!!! You completed the challenge</Text>
            <Text style={styles.modalText}>
              You completed the game in {moves} moves. Your best score is {bestScore} moves.
            </Text>
            <Button title="Restart" onPress={handleRestart} color="#3A5A40" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3B18A',
    padding: 10,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: '18%',
    height: 80,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    transform: [{ rotateY: '180deg' }],
  },
  flipped: {
    transform: [{ rotateY: '180deg' }],
  },
  inactive: {
    opacity: 0.3,
  },
  cardText: {
    fontSize: 25,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  score: {
    fontSize: 18,
    color: '#000',
  },
  bold: {
    fontWeight: 'bold',
  },
  highScore: {
    marginTop: 10,
    fontSize: 18,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});