// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyDES6_0IcAl5vTjWyhxrLsOAria2QtyVac",

  authDomain: "iptchat-ad69f.firebaseapp.com",

  projectId: "iptchat-ad69f",

  storageBucket: "iptchat-ad69f.appspot.com",

  messagingSenderId: "603106071318",

  appId: "1:603106071318:web:6c8c21d0173dbb772b7637"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);