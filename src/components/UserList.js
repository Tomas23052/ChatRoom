import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';

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
    <div>
      <h2>Online User List</h2>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.uid}>{user.displayName} - {user.room || "O gaijo está no caralho, ou há espera dele"}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
