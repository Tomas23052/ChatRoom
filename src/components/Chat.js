import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase-config.js";
import { updateProfile } from "firebase/auth";
import { storage } from "../firebase-config.js";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { getDownloadURL } from "firebase/storage";
import "../styles/Chat.css";

const onlineUsers = collection(db, "onlineUsers");

export const Chat = (props) => {
  const { room } = props;
  const [roomSet, setRoomSet] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [combinedItems, setCombinedItems] = useState([]);
  const messagesRef = collection(db, "messages");
  const imagesRef = collection(db, "images");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setColor] = useState();
  const [imageUpload, setImageUpload] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState(0);

  useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "asc")
    );

    roomRef.current = room;
  
    const unsubscribeMessages = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setCombinedItems([...messages]);
      scrollToBottom();

      const currentUser = auth.currentUser.displayName;
      const newMessages = messages.filter(
        (msg) =>
          msg.user !== currentUser &&
          msg.createdAt > lastReadTime &&
          msg.createdAt === messages[messages.length - 1].createdAt // Only consider the last message
      );
    });

    const queryImages = query(
      imagesRef,
      where("room", "==", room),
      orderBy("createdAt", "asc")
    );
    const unsubscribeImages = onSnapshot(queryImages, (snapshot) => {
      let images = [];
      snapshot.forEach((doc) => {
        images.push({ ...doc.data(), id: doc.id });
      });
      setCombinedItems((prevItems) => [...prevItems, ...images]);
      scrollToBottom();
    });

    return () => {
      unsubscribeMessages();
      unsubscribeImages();
    };
  }, [room]);



  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setUnreadCount(0);
      setLastReadTime(Date.now());
    }
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer.lastChild) {
      messagesContainer.lastChild.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  const setRoom = async () => {
    const q = query(onlineUsers, where('uid', '==', auth.currentUser.uid));
  
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {  
      const documentSnapshot = querySnapshot.docs[0];
      const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);
      
      await updateDoc(onlineUserDoc, {
        room: roomRef.current, 
      });
    }
  }

  const roomRef = useRef(null);

  useEffect(() => {
    if (!roomSet && roomRef.current) {
      setRoom();
      setRoomSet(true); 
    }
  }, [roomSet])
  
  



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    updateProfile(auth.currentUser, { photoURL: photoURL });
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      photoURL: photoURL,
      room,
    });
    setNewMessage("");
  };

  const leaveRoom = async () => {
    
      const q = query(onlineUsers, where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const documentSnapshot = querySnapshot.docs[0];
        const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);

        await updateDoc(onlineUserDoc, {
          room: "",
        });

        roomRef.current = null;


        // Optionally, you can trigger additional updates or actions here based on leaving the room
      }

  };
  
  const handleRefresh = async () => {
    await leaveRoom();
    window.location.reload();

  };
  
  

  const uploadImage = async () => {
    if (imageUpload == null) return;

    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    const snapshot = await uploadBytes(imageRef, imageUpload);
    const imageUrl = await getDownloadURL(snapshot.ref);

    await addDoc(imagesRef, {
      imageUrl,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      photoURL: photoURL,
      room,
    });
    alert("Uploaded");
    return setImageUpload(null);
  };

  return (
    <div className="chat-app">
      <div className="header">
        <h1>
          {room} {unreadCount > 0 && `(${unreadCount} new)`}
        </h1>
      </div>
      <div
        id="messages-container"
        className="messages"
        style={{ overflow: "auto", height: "600px" }}
      >
        {combinedItems
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((item) => (
            <div className="message" key={item.id}>
              <span className="user" style={{ color: item.photoURL }}>
                {item.user}
              </span>
              {item.text && <div>{item.text}</div>}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={`Uploaded by ${item.user}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    marginTop: "10px",
                  }}
                />
              )}
            </div>
          ))}
        <div
          ref={(el) => {
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
          Mandai
        </button>
      </form>
      <button className="button" onClick={handleRefresh}>
        Farto desta merda
      </button>
    </div>
  );
};
