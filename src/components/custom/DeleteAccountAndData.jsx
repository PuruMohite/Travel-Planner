import {
    getAuth,
    deleteUser
  } from "firebase/auth";
  import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
  } from "firebase/firestore";
  import { signOut } from "firebase/auth";
  
  const auth = getAuth();
  const db = getFirestore();
  
  export const DeleteAccountAndData = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      console.error("No authenticated user found.");
      return;
    }
  
    const userId = user.uid;
    const userEmail = user.email;
  
    try {
      // 1. Delete documents from AITrips where userEmail === user.email
      const aiTripsQuery = query(
        collection(db, "AITrips"),
        where("userEmail", "==", userEmail)
      );
      const aiTripsSnap = await getDocs(aiTripsQuery);
      const aiTripsDeletes = aiTripsSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "AITrips", docSnap.id))
      );
  
      // 2. Delete documents from posts where userId === user.uid
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId)
      );
      const postsSnap = await getDocs(postsQuery);
      const postsDeletes = postsSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "posts", docSnap.id))
      );
  
      // 3. Delete the document from users where id === user.uid or email === user.email
      const usersQuery = query(
        collection(db, "users"),
        where("id", "==", userId)
      );
      const usersSnap = await getDocs(usersQuery);
      const usersDeletes = usersSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "users", docSnap.id))
      );
  
      // Wait for all deletions
      await Promise.all([
        ...aiTripsDeletes,
        ...postsDeletes,
        ...usersDeletes
      ]);
  
      // 4. Delete Firebase Auth user
      await deleteUser(user);

      // 5. Sign out locally
      await signOut(auth);
      localStorage.clear();
  
      console.log("User account and all data deleted successfully.");
    } catch (error) {
      console.error("Error deleting user data:", error);
    }
  };
  