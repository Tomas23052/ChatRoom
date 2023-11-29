import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';
import "../styles/UserList.css";

export const UserList = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const onlineUsersRef = collection(db, 'onlineUsers');
    
    const unsubscribe = onSnapshot(onlineUsersRef, (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        uid: doc.data().uid,
        displayName: doc.data().displayName,
        photoURL: doc.data().photoURL,
        room: doc.data().room,

      }));
      setOnlineUsers(userList);
    });

    return () => {
      // Unsubscribe when the component unmounts
      unsubscribe();
    };
  }, []);

  return (
    <div className='mainUsers'>
      <h2>Gaijo(a)s que estão por aí</h2>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.uid}><span style={{color: user.photoURL}}>{user.displayName}</span> - {user.room || "SLANDER"}</li>
        ))}
        {console.log(onlineUsers)}
      </ul>
    </div>
  );
};

export default UserList;
