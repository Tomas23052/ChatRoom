import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import Cookies from "universal-cookie";
import { Chat } from "./components/Chat";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config.js";
import { deleteDoc } from "firebase/firestore";
import { collection, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-config.js";
import "bootstrap/dist/css/bootstrap.min.css";
const cookies = new Cookies();
const onlineUsers = collection(db, "onlineUsers");


function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [currentRoom, setCurrentRoom] = useState("SLANDER"); // Initialize with a default room value
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setColor] = useState("");

  useEffect(() => {
    document.title = "CHATROOM SALAS FIXES";
    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If the user is signed in, update the display name state
        setDisplayName(user.displayName);
        //setColor(user.photoURL)
        console.log(user);
      }
    });

    return () => {
      // Unsubscribe when the component unmounts
      unsubscribe();
    };
  }, []);

  const handleRoomChange = (newRoom) => {
    setCurrentRoom(newRoom);
  };

  const signUserOut = async () => {
    try {
      const q = query(onlineUsers, where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const documentSnapshot = querySnapshot.docs[0];
        const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);
  
        await deleteDoc(onlineUserDoc);
        await signOut(auth);
        cookies.remove("auth-token");
        setIsAuth(false);
      }
    } catch (error) {
      console.error('Error occurred during sign-out:', error);
    }
  };

  //AGORA ESTÁ FEITO

  if (!isAuth) {
    return (
      <div className="App">
        <Auth setIsAuth={setIsAuth} />
      </div>
    );
  }

  return (
    <>
        <Chat room={currentRoom} setRoom={handleRoomChange} signOutFunction={signUserOut} />
    </>
  );
}

export default App;
