
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWloN2ZuftaM7UVUAm_9ok9DmCrInQkB0",
  authDomain: "astro-catalogo.firebaseapp.com",
  projectId: "astro-catalogo",
  storageBucket: "astro-catalogo.firebasestorage.app",
  messagingSenderId: "167228656496",
  appId: "1:167228656496:web:2ee8fab483f2fe376cddb5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const entrarAnonimamente = () => {
  return signInAnonymously(auth);
};