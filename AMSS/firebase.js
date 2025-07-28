// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBtU6pvq5jQRMdHyEfURpVq1yP8nr96qQU',
  authDomain: 'amsystem-33045.firebaseapp.com',
  projectId: 'amsystem-33045',
  storageBucket: 'amsystem-33045.appspot.com',
  messagingSenderId: '569148971593',
  appId: '1:569148971593:android:8133ad36ff510f6d6bbd98',
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
