import React, { useState, useRef } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import Cookies from "universal-cookie";
import { Chat } from "./components/Chat";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config.js";
const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const roomInputRef = useRef(null);

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
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
          style={{ marginLeft: "10px" }}
        >
          Sign Out
        </button>

      </div>
    </>
  );
}

export default App;