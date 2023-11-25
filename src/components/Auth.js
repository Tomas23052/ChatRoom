import { auth, provider } from "../firebase-config.js";
import { signInWithPopup } from "firebase/auth";
import Cookies from "universal-cookie";
import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import "../styles/Auth.css";
const cookies = new Cookies();


export const Auth = (props) => {
  const { setIsAuth } = props;
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setColor] = useState(""); // Default color for the user's names
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (displayName.trim() !== "") {
        
        await updateProfile(result.user, { displayName: displayName});
      }
      cookies.set("auth-token", result.user.refreshToken);

      setIsAuth(true);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="auth">
      <p>Sign In With Google</p>
      <input
        type="text"
        placeholder="Enter your name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <br/>
      <button onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  );
};
