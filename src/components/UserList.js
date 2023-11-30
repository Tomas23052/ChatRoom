import React, { useState, useEffect } from 'react';
import { db} from '../firebase-config';
import { collection, onSnapshot, query, where, getDocs, updateDoc } from 'firebase/firestore';
import "../styles/UserList.css";

export const UserList = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const authRef = collection(db, 'onlineUsers');
    
    const unsubscribe = onSnapshot(authRef, (snapshot) => {
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

  useEffect(() => {
    const checkInactiveUsers = async () => {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
      const q = query(collection(db, "auth"), where("lastActive", "<", oneHourAgo));
  
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          status: "inactive",
        }, { merge: true });
      });
    };
  
    // Check for inactive users every 5 minutes
    const intervalId = setInterval(checkInactiveUsers, 5 * 60 * 1000);
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className='mainUsers'>
      <h2>Gaijo(a)s que estão por aí</h2>
      <ul>
        {onlineUsers.map((user) => (
          <li 
            key={user.uid}
            style={{
              color: user.status === "active" ? 'green' : user.status === 'logged out' ? 'red' : 'yellow',
            }}
          >
            <span style={{listStyle: 'none'}}>
              •
            </span>
            <span style={{color: user.photoURL}}>{user.displayName}</span> - {user.room || "SLANDER"}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default UserList;
