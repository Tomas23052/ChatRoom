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
import { UserList } from "./UserList";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUsers,
  faShare,
  faTrash,
  faEdit,
  faReply,
} from "@fortawesome/free-solid-svg-icons";

const onlineUsers = collection(db, "onlineUsers");

export const Chat = (props) => {
  const { room, setRoom, signOutFunction } = props;
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
  const [replyToId, setReplyToId] = useState(null);


  useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "asc")
    );

   

    

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

    console.log(auth.currentUser);

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

  useEffect(() => {
    const handleVisibilityChange = async () => {
      const q = query(onlineUsers, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const documentSnapshot = querySnapshot.docs[0];
      const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);
  
      if (document.visibilityState === 'hidden') {
        await updateDoc(onlineUserDoc, {
          lastActiveAt: new Date(),
        });
      }
    };
    const handleClick = async () => {
      const q = query(onlineUsers, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const documentSnapshot = querySnapshot.docs[0];
      const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);
  
      await updateDoc(onlineUserDoc, {
        status: "active",
        lastActiveAt: new Date(),
      });
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('click', handleClick);

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

      if (user.photoURL == null) {
        document.getElementById("colorPicker").value = "#000";
        setColor(document.getElementById("colorPicker").value);
      } else {
        setColor(user.photoURL);
        document.getElementById("colorPicker").value = user.photoURL;
      }
    }

    document.getElementsByClassName("new-message-input")[0].focus();
  }, [room]);

  const handleClickRoom = async (newRoom) => {
    const q = query(onlineUsers, where("uid", "==", auth.currentUser.uid));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];
      const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);

      await updateDoc(onlineUserDoc, {
        room: newRoom,
      });

      // Use setRoom to update the room value
      setRoom(newRoom);
    }

    console.log("CurrentRoom: " + room); // This might not immediately reflect the updated room value due to the asynchronous nature of state updates
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    updateProfile(auth.currentUser, { photoURL: photoURL });
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      photoURL: document.getElementById("colorPicker").value,
      room,
      
    });
    setNewMessage("");
  };

  const leaveRoom = async () => {
    const q = query(onlineUsers, where("uid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];
      const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);

      await updateDoc(onlineUserDoc, {
        room: "",
      });

      // Optionally, you can trigger additional updates or actions here based on leaving the room
    }
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

  const dates = {};
  combinedItems.forEach(async (item) => {
    if (item.createdAt) {
      const date = item.createdAt.toDate().toLocaleDateString("pt-PT");
      if (!dates[date]) dates[date] = [];
      dates[date].push(item);
    }
  });

  const showHideUsers = () => {
    const userList = document.getElementById("userList");
    if (userList) {
      const computedStyles = getComputedStyle(userList);
      const visibility = computedStyles.visibility;

      if (visibility === "visible") {
        userList.style.visibility = "hidden";
      } else {
        userList.style.visibility = "visible";
      }
    }
  };

  const editMessage = async (item) => {
    const newText = prompt("Edit your message:", item.text);
    if (newText) {
      const docRef = doc(db, "messages", item.id);
      await updateDoc(docRef, {
        text: newText,
      });
    }
  };

  const removeMessage = async (item) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      const docRef = doc(db, "messages", item.id);
      await deleteDoc(docRef);
    }
  };

  const startReply = (id) => {
  setReplyToId(id);
};

const [replyText, setReplyText] = useState("");

const submitReply = async () => {
  await db.collection("replies").add({
    text: replyText,
    replyTo: replyToId,
    // Add other fields as needed, such as the user and timestamp
  });

  setReplyText("");
  setReplyToId(null);
};

  return (
    <div className="col chat-app">
      <div className="row d-flex tabList">
        <div
          className={`col-1 roomTab ${
            room === "SLANDER" ? "selectedRoomTab" : ""
          }`}
          onClick={() => handleClickRoom("SLANDER")}
        >
          Slander
        </div>
        <div
          className={`col-1 roomTab ${room === "CD" ? "selectedRoomTab" : ""}`}
          onClick={() => handleClickRoom("CD")}
        >
          CD
        </div>
        <div
          className={`col-1 roomTab ${
            room === "DEV-MOVEIS" ? "selectedRoomTab" : ""
          }`}
          onClick={() => handleClickRoom("DEV-MOVEIS")}
        >
          Dev-Moveis
        </div>
        <div
          className={`col-1 roomTab ${
            room === "ENG-SOFTWARE" ? "selectedRoomTab" : ""
          }`}
          onClick={() => handleClickRoom("ENG-SOFTWARE")}
        >
          Eng-Software
        </div>
        <div
          className={`col-1 roomTab ${room === "IRL" ? "selectedRoomTab" : ""}`}
          onClick={() => handleClickRoom("IRL")}
        >
          IRL
        </div>
        <div
          className={`col-1 roomTab ${
            room === "SEG-INF" ? "selectedRoomTab" : ""
          }`}
          onClick={() => handleClickRoom("SEG-INF")}
        >
          Seg-Inf
        </div>

        <div className="col">
          <div className="row otherTabs">
            <div className="col-1 roomTab otherTab" onClick={showHideUsers}>
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="col-1 roomTab otherTab" onClick={signOutFunction}>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </div>
          </div>
        </div>
      </div>

      <div id="messages-container" className="row messages">
        {Object.keys(dates).map((date) => (
          <div key={date}>
            <div className="date">{date}</div>

            {dates[date].map((item) => (
              <div className="message" key={item.id}>
                <span className="user" style={{ color: item.photoURL }}>
                  {item.user}
                </span>
                <span className="date">
                  {item.createdAt
                    ? item.createdAt.toDate().toLocaleTimeString("pt-PT", {
                        hour: "numeric",
                        minute: "numeric",
                      })
                    : item.createdAt}
                </span>

                {item.text && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{item.text}</span>
                    {item.user === auth.currentUser.displayName && (
                      <div>
                        <button
                          style={{ background: "none", border: "none" }}
                          onClick={() => editMessage(item)}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            size="sm"
                          ></FontAwesomeIcon>
                        </button>
                        <button
                          style={{ background: "none", border: "none" }}
                          onClick={() => removeMessage(item)}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            size="sm"
                          ></FontAwesomeIcon>
                        </button>
                       <button
                          style={{ background: "none", border: "none" }}
                          onClick={() => startReply(item.id)}
                        >
                          <FontAwesomeIcon
                            icon={faReply}
                            size="sm"
                          ></FontAwesomeIcon>
                        </button>
                      </div>
                    )}
                     
                  </div>
                )}
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
        ))}
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
          <FontAwesomeIcon icon={faShare} />
        </button>
      </form>

      <div id="userList">
        <UserList></UserList>
      </div>
    </div>
    /*<div className="chat-app">
      <div className="header">
        <h1>
          {room} {unreadCount > 0 && `(${unreadCount} new)`}
        </h1>
      </div>
      <div id="messages-container"
      className="messages"
      style={{ overflow: "auto", height: "600px" }}
    >
        {Object.keys(dates).map((date) => (
          <div key={date}>
            <div className="date">{date}</div>

            {dates[date].map((item) => (
              <div className="message" key={item.id}>
                <span className="user" style={{ color: item.photoURL }}>
                  {item.user}
                </span>
                <span className="date">
                  {item.createdAt
                    ? item.createdAt.toDate().toLocaleTimeString("pt-PT", {
                        hour: "numeric",
                        minute: "numeric",
                      })
                    : item.createdAt}
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
        ))}
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
    </div>*/
  );
};
