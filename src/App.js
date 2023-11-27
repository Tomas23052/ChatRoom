import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import Cookies from "universal-cookie";
import { Chat } from "./components/Chat";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config.js";
import { UserList } from "./components/UserList";
import { deleteDoc } from "firebase/firestore";
import { collection, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-config.js";
const cookies = new Cookies();
const onlineUsers = collection(db, "onlineUsers");


function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setColor] = useState("");
  useEffect(() => {
    document.title = "CHATROOM SALAS FIXES";
    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If the user is signed in, update the display name state
        setDisplayName(user.displayName);
        //setColor(user.photoURL);
        console.log(user);
      }
    });

    return () => {
      // Unsubscribe when the component unmounts
      unsubscribe();
    };
  }, []);

  const signUserOut = async () => {
    const q = query(onlineUsers, where('uid', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];
      const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);
  
      try {
        await deleteDoc(onlineUserDoc);
        await signOut(auth);
        cookies.remove("auth-token");
        setIsAuth(false);
        setRoom(null);
      } catch (error) {
        console.error('Error deleting online user:', error);
      }
    }
  };

  if (!isAuth) {
    return (
      <div className="App">
        <Auth setIsAuth={setIsAuth} />
      </div>
    );
  }

  return (
    <>
      {room ? (
        <Chat room={room} />
      ) : (
        <div style={{ marginLeft: "10px" }}>
          <UserList />
          <h1>Chats disponíveis:</h1>
          <h3 className="h3" onClick={() => setRoom("SLANDER")}>
            - SLANDER
          </h3>
          <h3 className="h3" onClick={() => setRoom("CD")}>
            - CD
          </h3>
          <h3 className="h3" onClick={() => setRoom("DEV-MOVEIS")}>
            - DEV-MOVEIS
          </h3>
          <h3 className="h3" onClick={() => setRoom("ENG-SOFTWARE")}>
            - ENG-SOFTWARE
          </h3>
          <h3 className="h3" onClick={() => setRoom("IRL")}>
            - IRL
          </h3>
          <h3 className="h3" onClick={() => setRoom("SEG-INF")}>
            - SEG-INF
          </h3>
        </div>
      )}

      <div className="sign-out">
        <button
          className="button"
          onClick={signUserOut}
          style={{ marginBottom: "10px" }}
        >
          Vou meter-me no caralho
        </button>
      </div>
    </>
  );
}

export default App;
