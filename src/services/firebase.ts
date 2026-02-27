// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7sxs1jN90Ywxib-I85G0SOLdFh2AYRNI",
  authDomain: "flugo-challenge-66dea.firebaseapp.com",
  projectId: "flugo-challenge-66dea",
  storageBucket: "flugo-challenge-66dea.firebasestorage.app",
  messagingSenderId: "336749010748",
  appId: "1:336749010748:web:446d5dbd6c503a7fd0c839",
  measurementId: "G-L3998V3LQZ"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados (Firestore) para usarmos no restante do projeto
export const db = getFirestore(app);