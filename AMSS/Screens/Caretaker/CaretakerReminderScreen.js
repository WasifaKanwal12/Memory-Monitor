import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { getFirestore, doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons

const CaretakerReminderScreen = ({ route }) => {
  const { patientId } = route.params;
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const auth = getAuth();
  const caretakerId = auth.currentUser?.uid;
  const db = getFirestore();

  const generateUniqueId = () => {
    const currentTime = Date.now();
    const randomOffset = Math.floor(Math.random() * 100000);
    const uniqueId = currentTime - randomOffset;
    return `reminder_${uniqueId}`;
  };

  const handleAddReminder = async () => {
    if (!reminderTitle || !reminderDescription || !reminderDate || !reminderTime) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    try {
      const fullDateTime = new Date(
        reminderDate.getFullYear(),
        reminderDate.getMonth(),
        reminderDate.getDate(),
        reminderTime.getHours(),
        reminderTime.getMinutes()
      );

      const newReminder = {
        id: generateUniqueId(),
        title: reminderTitle,
        description: reminderDescription,
        time: fullDateTime.toISOString(),
        caretakerId,
        done: false,
      };

      const patientRef = doc(db, 'reminders', patientId);
      const docSnapshot = await getDoc(patientRef);

      if (!docSnapshot.exists() || !docSnapshot.data().reminders) {
        await setDoc(patientRef, { reminders: [] }, { merge: true });
      }

      await setDoc(patientRef, { reminders: arrayUnion(newReminder) }, { merge: true });

      Alert.alert('Success', 'Reminder added successfully!');
      setReminderTitle('');
      setReminderDescription('');
      setReminderDate(new Date());
      setReminderTime(new Date());
    } catch (error) {
      console.error('Error adding reminder:', error);
      Alert.alert('Error', 'Failed to add reminder!');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Reminder</Text>
      </View>

      <View style={styles.inputContainer}>
        {/* Reminder Title Input */}
        <View style={styles.inputWrapper}>
          <Icon name="event" style={[styles.icon, styles.titleIcon]} />
          <TextInput
            style={[styles.input, styles.titleInput]}
            placeholder="Reminder Title"
            value={reminderTitle}
            onChangeText={setReminderTitle}
          />
        </View>

        {/* Reminder Description Input */}
        <View style={styles.textAreaWrapper}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Reminder Description"
            value={reminderDescription}
            onChangeText={setReminderDescription}
            multiline
          />
          <Icon name="description" style={[styles.icon, styles.textAreaIcon]} />
        </View>

        {/* Date Picker Button */}
        <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateTimeButtonText}>
            {`Select Date: ${reminderDate.toLocaleDateString()}`}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Time Picker Button */}
        <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateTimeButtonText}>
            {`Select Time: ${reminderTime.toLocaleTimeString()}`}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A3B18A',
  },
  header: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'black',
    fontSize: 22,
    fontWeight: 'bold',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A5A40',
  },
  titleInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  textAreaWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingLeft: 40,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#3A5A40',
    borderRadius: 10,
  },
  textAreaIcon: {
    position: 'absolute',
    top: '50%',
    left: 10,
    transform: [{ translateY: -12 }],
    color: '#3A5A40',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
    color: '#3A5A40',
  },
  titleIcon: {
    marginTop: -4, // Adjust icon position slightly upwards to align with the input
  },
  dateTimeButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  dateTimeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CaretakerReminderScreen;
