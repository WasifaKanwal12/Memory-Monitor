import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const MemoryBoxScreen = () => {
  const [imagesData, setImagesData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const patientId = auth.currentUser?.uid; // Patient ID

  // Fetch images from Firestore
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const db = getFirestore();
        const imagesDocRef = doc(db, 'Images', patientId); // Get images for the specific patient
        const docSnapshot = await getDoc(imagesDocRef);

        if (docSnapshot.exists()) {
          const images = docSnapshot.data().images || [];
          setImagesData(images);
        } else {
          console.log('No images found');
        }
      } catch (error) {
        console.error('Error fetching images: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [patientId]);

  // Render individual image box
  const renderImageBox = (image) => (
    <TouchableOpacity
      key={image.imageUrl}
      style={styles.imageBox}
      onPress={() => setSelectedImage(image)} // Show full image when clicked
    >
      <Image source={{ uri: image.imageUrl }} style={styles.image} />
      <Text style={styles.imageDescription}>{image.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Title with rounded rectangle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Memory Box</Text>
      </View>

      {/* Loading or Images display */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.imagesContainer}>
            {imagesData.map((image) => renderImageBox(image))}
          </View>
        </ScrollView>
      )}

      {/* Modal to show selected image */}
      {selectedImage && (
        <Modal
          visible={true}
          transparent={true}
          onRequestClose={() => setSelectedImage(null)} // Close modal when clicked outside
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage.imageUrl }} style={styles.modalImage} />
              <Text style={styles.modalDescription}>{selectedImage.description}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#A3B18A",
  },
  titleContainer: {
    paddingVertical: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  imagesContainer: {
    flexDirection: 'column', // Change to column to stack items vertically
    justifyContent: 'center',
  },
  imageBox: {
    backgroundColor: '#fff',
    width: '100%', // Make image box take up the full width
    marginBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200, // Set a fixed height for the image
    borderRadius: 10,
  },
  imageDescription: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#990000',
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MemoryBoxScreen;
