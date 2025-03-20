// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjGwtHW0LUCViydhwZyTc7tZlVZmvPkEo",
  authDomain: "travel-planner-89f16.firebaseapp.com",
  projectId: "travel-planner-89f16",
  storageBucket: "travel-planner-89f16.firebasestorage.app",
  messagingSenderId: "447686962484",
  appId: "1:447686962484:web:532ee25e3501dc29114961",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
