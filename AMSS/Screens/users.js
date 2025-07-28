import { db } from "../firebase";
import { collection, setDoc, where, query, getDocs ,doc } from 'firebase/firestore';

// Create a reference to the 'users' collection
const usersCollection = collection(db, 'users');

// Function to create a user
const createUser = async (userData,user) => {
  try {
    
    const userRef =await setDoc(doc(db, 'users', user.uid), userData);
    return userRef;
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

// Function to get a user by email
const getUserByEmail = async (email) => {
  try {
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data(); // You can return more user info as needed
    } else {
      return null; // No user found with that email
    }
  } catch (error) {
    console.error('Error getting user by email:', error);
  }
};

export { createUser, getUserByEmail };
