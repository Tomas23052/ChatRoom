import { auth, provider } from "../firebase-config.js";
import { signInWithPopup } from "firebase/auth";
import { updateProfile } from 'firebase/auth';
import Cookies from "universal-cookie";
import React, { useState, useEffect } from 'react';
import "../styles/Auth.css";
import { collection } from "firebase/firestore";
import { addDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config.js";

const cookies = new Cookies();
const onlineUsers = collection(db, "onlineUsers");

function Title() {
  useEffect(() => {
    document.title = 'CHATROOM LOGIN FILHO';
  }, []);
}

export const Auth = (props) => {
  const { setIsAuth } = props;
  const [displayName, setDisplayName] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const validateAnswer = () => {
    // Check if the question answer contains the required word
    if (questionAnswer.toLowerCase().includes("caralho")) {
      setShowLogin(true);
    } else {
      alert("Burro de merda, não há de ser isso");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (displayName.trim() !== "") {
        await updateProfile(result.user, { displayName: displayName });
      }
      cookies.set("auth-token", result.user.refreshToken);
  
      const q = query(onlineUsers, where("uid", "==", result.user.uid));
      const querySnapshot = await getDocs(q);
      const userExists = !querySnapshot.empty;
  
      if (userExists) {
        await updateDoc(querySnapshot.docs[0].ref, {
          status: "active",
        });
      } else {
        await addDoc(onlineUsers, {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
          room: "",
          status: "active",
          lastActiveAt: new Date(),
        });
      }
  
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    }
  };
     
      
      


  return (
    <div className="auth">
      {Title()}
      {!showLogin && (
        <div>
          <p>Quem?</p>
          <input
            type="text"
            placeholder="Enter your response"
            value={questionAnswer}
            onChange={(e) => setQuestionAnswer(e.target.value)}
          />
         
          <button style={{marginLeft: 10}} onClick={validateAnswer}>Proceed</button>
        </div>
      )}
      {showLogin && (
        <div>
          <h3>Manda aí Login oh Boi, pelo google de preferência</h3>
          <p >Se já meteste nome antes, deixa-te estar e dá login</p>
          <input
            type="text"
            placeholder="Mas quem és tu?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        
          <button style={{marginLeft: 10}} onClick={signInWithGoogle}>Dwarf Gay Porn</button>
        </div>
      )}
    </div>
  );
};
