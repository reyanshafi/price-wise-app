// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD71DSimp6rMSVnq3o3fmQH1uwjz2k8RgM",
  authDomain: "price-wise-app.firebaseapp.com",
  projectId: "price-wise-app",
  storageBucket: "price-wise-app.firebasestorage.app",
  messagingSenderId: "849892343005",
  appId: "1:849892343005:web:31cfb3f000713942db2f34",
  measurementId: "G-MJ455Z63N1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
