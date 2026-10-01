// src/firebase.js
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLQKtO5lvPpK8ap6NlqDDZqRCyePnZOWs",
  authDomain: "protransf-dmjc.firebaseapp.com",
  projectId: "protransf-dmjc",
  storageBucket: "protransf-dmjc.firebasestorage.app",
  messagingSenderId: "1073111468775",
  appId: "1:1073111468775:web:6b0f6778972c7a37d1b042",
  measurementId: "G-Y1N9B0Z2ZF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
