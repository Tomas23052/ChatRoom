import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,

} from "firebase/firestore";
import { auth, db } from "../firebase-config.js";
import { updateProfile } from 'firebase/auth';
import "../styles/Chat.css";

export const Chat = (props) => {
  const { room } = props;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = collection(db, "messages");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setColor] = useState(); // Default color for the user's names

  useEffect(() => {
    document.title = "CHATROOM " + room;
    const messagesContainer = document.getElementById("messages-container");
    console.log(messagesContainer.id);

    const queryMessages = query(messagesRef, where("room", "==", room), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);

      // Scroll to the bottom when new messages are added
      if (messagesContainer.lastChild) {
        messagesContainer.lastChild.scrollIntoView({ behavior: 'smooth' });
      }
    });


    return () => unsubscribe();
    // Scroll to the bottom when the component initially renders

  }, [room]);

  useLayoutEffect(() => {


    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName);
    }
    if (user.photoURL == null) {
      document.getElementById("colorPicker").value = "#000";
      setColor(document.getElementById("colorPicker").value);
    } else {
      setColor(user.photoURL);
      document.getElementById("colorPicker").value = user.photoURL;
    }

    document.getElementsByClassName("new-message-input")[0].focus();
  }, [room]);




  const handleSubmit = async (e) => {


    e.preventDefault();
    if (newMessage === "") return;
    updateProfile(auth.currentUser, { photoURL: photoURL });
    console.log(auth.currentUser.photoURL);
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      photoURL: photoURL,
      room,
    });
    setNewMessage("");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="chat-app">
      <div className="header">
        <h1>Bem-vindo ao chat {room}</h1>
      </div>
      <div id="messages-container" className="messages" style={{ overflow: "auto", height: "600px" }}>
        {messages.map((message) => (
          <div className="message" key={message.id}>
            <span
              className="user"
              style={{ color: message.photoURL }}
            >
              {message.user}
            </span>
            {message.text}
          </div>
        ))}
        <div
          ref={(el) => {
            // Using a ref to keep track of the last message element
            if (el) {
              el.scrollIntoView({ behavior: "instant" });
            }
          }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="new-message-form">
        <input
          id="colorPicker"
          className="color-picker"
          type="color"
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          className="new-message-input"
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
          placeholder="Type your message here..."
        />
        <button className="send-button" type="submit">
          Send
        </button>
      </form>
      <button className="button" onClick={handleRefresh}>
        Go Back
      </button>
    </div>
  );

};