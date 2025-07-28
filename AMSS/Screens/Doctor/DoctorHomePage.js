import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const DoctorScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImagePicker = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      (response) => {
        if (response.didCancel) {
          Alert.alert('Cancelled', 'You cancelled image selection.');
        } else if (response.errorCode) {
          Alert.alert('Error', `Image picker error: ${response.errorMessage}`);
        } else if (response.assets && response.assets.length > 0) {
          const { uri } = response.assets[0];
          setSelectedImage(uri); // Save the image URI
        }
      }
    );
  };

  const handleDetection = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    try {
      setLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: selectedImage.split('/').pop(),
        type: 'image/jpeg',
      });

      const response = await fetch('https://3845-2404-3100-104f-8986-456e-5255-ea41-be80.ngrok-free.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDetectionResult(
          result.class
            ? `Prediction: ${result.class} (${(result.confidence).toFixed(2)}%)`
            : 'No result received.'
        );
      } else {
        Alert.alert('Error', `Detection failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Error', 'Failed to process the image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>Please upload an image from gallery</Text>

      <TouchableOpacity style={styles.selectImageButton} onPress={handleImagePicker}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      <View style={styles.imageBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Image
                  source={require('../../Images/imgplchldr.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
        )}
      </View>

      <TouchableOpacity
        style={styles.detectButton}
        onPress={handleDetection}
        disabled={loading}
      >
        <Text style={styles.DetectbuttonText}>
          {loading ? 'Processing...' : 'Detect'}
        </Text>
      </TouchableOpacity>

      {detectionResult ? (
        <Text style={styles.resultBox}>{detectionResult}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectImageButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 20,
  },
  detectButton: {
    backgroundColor: 'transparent',
    borderWidth: 2, 
    borderColor: '#3A5A40', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25, 
    marginTop: 20,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  DetectbuttonText: {
    fontSize: 18,
    color: '#3A5A40',
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  imageBox: {
    width: '90%',
    height: 300,
    backgroundColor: 'grey',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 50,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    borderColor: '#000',
    borderWidth: 1,
  },
});

export default DoctorScreen;
