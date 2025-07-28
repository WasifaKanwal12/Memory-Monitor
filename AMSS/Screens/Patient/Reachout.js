import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';

import { getAuth } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getFirestore,
} from 'firebase/firestore';

const ReachOutScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchContacts = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, 'contacts', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContacts(data.contactList || []);
        } else {
          await setDoc(docRef, { contactList: [] }); // Create if not exists
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, [userId]);

  const addContact = async () => {
    if (!name || !phone) {
      Alert.alert('Missing Info', 'Please enter both name and number.');
      return;
    }

    const newContact = { name, phone };

    try {
      const docRef = doc(db, 'contacts', userId);
      await updateDoc(docRef, {
        contactList: arrayUnion(newContact),
      });

      setContacts((prev) => [...prev, newContact]);
      setName('');
      setPhone('');
    } catch (error) {
      // In case document doesn't exist yet (first time user)
      if (error.code === 'not-found') {
        try {
          await setDoc(doc(db, 'contacts', userId), {
            contactList: [newContact],
          });
          setContacts([newContact]);
          setName('');
          setPhone('');
        } catch (e) {
          console.error('Failed to create contacts doc:', e);
        }
      } else {
        console.error('Error adding contact:', error);
      }
    }
  };

  const handleWhatsAppCall = (phone) => {
    const url = `whatsapp://send?phone=${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('WhatsApp is not installed or not supported.');
        } else {
          Linking.openURL(url);
        }
      })
      .catch((err) => console.error('WhatsApp Call Error:', err));
  };

  const handleSMS = (phone) => {
    const url = `sms:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('SMS not supported on this device.');
        } else {
          Linking.openURL(url);
        }
      })
      .catch((err) => console.error('SMS Error:', err));
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactCard}>
      <Text style={styles.contactName}>{item.name}</Text>
      <Text style={styles.contactPhone}>{item.phone}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleWhatsAppCall(item.phone)}
        >
          <Text style={styles.buttonText}>WhatsApp Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smsButton}
          onPress={() => handleSMS(item.phone)}
        >
          <Text style={styles.buttonText}>Send SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reach Out Contacts</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderContact}
        contentContainerStyle={styles.contactList}
      />

      <View style={styles.addContactSection}>
        <TextInput
          placeholder="Enter Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Enter Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAD7CD',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  contactList: {
    paddingBottom: 20,
  },
  contactCard: {
    backgroundColor: '#A3B18A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344E41',
  },
  contactPhone: {
    fontSize: 16,
    color: '#344E41',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    backgroundColor: '#25D366',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  smsButton: {
    backgroundColor: '#588157',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addContactSection: {
    marginTop: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#344E41',
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReachOutScreen;
