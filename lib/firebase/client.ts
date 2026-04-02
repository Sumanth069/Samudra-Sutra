import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBL8p4kkgFf9fbk5R5e-hE7_04RehLRbsY",
  authDomain: "samudra-651d7.firebaseapp.com",
  projectId: "samudra-651d7",
  storageBucket: "samudra-651d7.firebasestorage.app",
  messagingSenderId: "686538144725",
  appId: "1:686538144725:web:66c0a5a44f8c05a47f1b5c",
  measurementId: "G-DK2KWMGXX3"
};

// Initialize Firebase only if it hasn't been already (prevents hot-reload crashes)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
