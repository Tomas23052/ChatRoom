import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase-config';

export const UserList = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const onlineUsersRef = collection(db, 'onlineUsers');
    const q = query(onlineUsers, where('uid', '==', auth.currentUser.uid));
    const querySnapshot = onSnapshot(q, (snapshot) => {
    if (!querySnapshot.empty) {
    const documentSnapshot = snapshot.docs[0];
    const onlineUserDoc = doc(onlineUsers, documentSnapshot.id);
    updateDoc(onlineUserDoc, {
      room: null,
    });
  }
});
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
        {console.log(onlineUsers)}
      </ul>
    </div>
  );
};

export default UserList;
