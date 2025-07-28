import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

const PatientReminderScreen = ({ route }) => {
  const { patientId } = route.params;
  const [reminders, setReminders] = useState([]);
  const navigation = useNavigation();

  // Listen for Firestore changes
  useEffect(() => {
    const db = getFirestore();
    const remindersRef = doc(db, 'reminders', patientId);

    const unsubscribe = onSnapshot(remindersRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const reminderData = docSnapshot.data().reminders || [];
        setReminders(reminderData);

        reminderData.forEach((reminder) => {
          if (!reminder.done) {
            const reminderTime = new Date(reminder.time).getTime();
            const currentTime = Date.now();

            if (reminderTime >= currentTime) {
              // Schedule notification for the reminder time
              scheduleNotification(reminder);
            }
          }
        });
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [patientId]);

  const scheduleNotification = async (reminder) => {
    const reminderTime = new Date(reminder.time).getTime();
    const currentTime = Date.now();
    const timeDiff = reminderTime - currentTime;
  
    // Prevent scheduling if the reminder is marked as done
    if (reminder.done) return;
  
    if (timeDiff >= 0) {
      // Schedule the notification at the reminder time
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.description,
          sound: true,
          data: { screen: 'PatientReminderScreen', patientId, reminderId: reminder.id },
        },
        trigger: { seconds: Math.max(timeDiff / 1000, 0) }, 
      });
  
      // Set up a periodic check for reminders that are not marked as done
      const intervalId = setInterval(async () => {
        const db = getFirestore();
        const remindersRef = doc(db, 'reminders', patientId);
        const docSnapshot = await getDoc(remindersRef);
  
        if (docSnapshot.exists()) {
          const remindersList = docSnapshot.data().reminders || [];
          const currentReminder = remindersList.find((r) => r.id === reminder.id);
  
          if (currentReminder && !currentReminder.done) {
            // Reschedule notification
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Reminder: ${reminder.title}`,
                body: reminder.description,
                sound: true,
                data: { screen: 'PatientReminderScreen', reminderId: reminder.id },
              },
              trigger: { seconds: 180 }, 
            });
          } else {
            // Stop the interval when the reminder is marked as done
            clearInterval(intervalId);
          }
        }
      }, 120000); // Check every 2 minutes
    }
  };

  // Inside your markAsDone function
  const markAsDone = async (reminderId) => {
    try {
      const db = getFirestore();
      const remindersRef = doc(db, 'reminders', patientId);
      const docSnapshot = await getDoc(remindersRef);

      if (docSnapshot.exists()) {
        const remindersList = docSnapshot.data().reminders || [];
        const updatedReminders = remindersList.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, done: true } : reminder
        );

        await updateDoc(remindersRef, { reminders: updatedReminders });
        setReminders(updatedReminders);

        // Cancel the notification for this reminder
        await Notifications.cancelAllScheduledNotificationsAsync(reminderId);
      }
    } catch (error) {
      console.error('Error marking as done:', error);
    }
  };

  // Render reminder item
  const renderReminderItem = ({ item }) => (
    <View style={styles.reminder}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text>{new Date(item.time).toLocaleString()}</Text>
      <TouchableOpacity
        style={[styles.button, item.done && styles.completedButton]}
        onPress={() => markAsDone(item.id)}
        disabled={item.done}
      >
        <Text style={styles.buttonText}>
          {item.done ? 'Completed' : 'Mark as Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Your Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center', // Center the title text
    marginVertical: 20, // Add margin for spacing
  },
  reminder: {
    padding: 15,
    marginBottom: 15,
    borderColor: '#3A5A40', // Border color changed to #3A5A40
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f9f9f9', // Background color for each reminder
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#3A5A40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50, // Border radius set to 50
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  completedButton: {
    backgroundColor: '#A9A9A9', // Gray background for completed reminders
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PatientReminderScreen;
