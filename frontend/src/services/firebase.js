// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDNEQgzcdex2xBHiDD3DqYYYmROmubSAXE",
  authDomain: "meal-card-system.firebaseapp.com",
  projectId: "meal-card-system",
  storageBucket: "meal-card-system.appspot.com",
  messagingSenderId: "513577256861",
  appId: "1:513577256861:web:ad2e64a111233556749174",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
