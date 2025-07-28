import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { storage } from '../../firebase'; // Import your firebase storage config

const AddImageScreen = ({ route }) => {
  const { patientId } = route.params; // Patient ID passed from PatientList
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const caretakerId = auth.currentUser?.uid;

  // Function to pick an image from the gallery of user
  const handleImagePicker = async () => {
    launchImageLibrary(
      { mediaType: 'photo' },
      async (response) => {
        if (response.didCancel) {
          Alert.alert('Cancelled', 'You cancelled image selection.');
        } else if (response.errorCode) {
          Alert.alert('Error', `Image picker error: ${response.errorMessage}`);
        } else if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri); // Set the selected image URI
        }
      }
    );
  };

  // Function to upload the image and description to Firebase
  const handleSaveImage = async () => {
    if (!caretakerId) {
      Alert.alert("Error", "User is not authenticated. Please log in again.");
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    if (!description) {
      Alert.alert('Error', 'Please add a description.');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `images/${Date.now()}.jpg`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);

      // Create image data object
      const newImage = {
        imageUrl: downloadURL,
        description,
      };

      // Use setDoc to create the document in the Images collection
      const imagesDocRef = doc(db, 'Images', patientId); // Document ID is patientId
      await setDoc(
        imagesDocRef,
        {
          images: arrayUnion(newImage), // Add the new image to the images array
          caretakerId: caretakerId, // Include caretakerId
        },
        { merge: true } // Merge data if the document already exists
      );

      Alert.alert('Success', 'Image and description saved successfully!');
      setImageUri(null);
      setDescription('');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Add Images</Text>

      {/* Image Box */}
      <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Click to select image</Text> // Placeholder text
        )}
      </TouchableOpacity>

      {/* Description Input */}
      <TextInput
        style={styles.textInput}
        placeholder="Enter Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
        multiline={true}
        textAlignVertical="top"
        numberOfLines={5}
      />

      {/* Save Image Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveImage}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Image</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A', // Screen background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
  },

  imageContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#3A5A40', // Image box border color
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
   
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  
  imagePlaceholder: {
    fontSize: 18,
    color: '#3A5A40', // Placeholder text color
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#3A5A40', // Input box border color
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#3A5A40', // Save button background color
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 50, 
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddImageScreen;
