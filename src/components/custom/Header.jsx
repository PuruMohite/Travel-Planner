import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { db } from "@/service/firebaseConfig";

const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

function Header() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [openDialog, setOpenDialog] = useState(false);

  // Handle Google Sign-In
  const getUserProfile = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Check Firestore if user exists
      const userRef = doc(db, "users", googleUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: googleUser.displayName,
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          createdAt: new Date(),
        });
      }

      // Store user info locally
      const userData = { uid: googleUser.uid, ...googleUser };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setOpenDialog(false);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  // Logout Function
  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="p-3 shadow-sm flex justify-between items-center px-5">
      <img src="/logo.svg" alt="Logo" />
      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <a href="/create-trip">
              <Button variant="outline" className="rounded-full cursor-pointer">
                + Create Trip
              </Button>
            </a>
            <a href="/my-trips">
              <Button variant="outline" className="rounded-full cursor-pointer">
                My Trips
              </Button>
            </a>
            <Popover>
              <PopoverTrigger>
                <img
                  src={user?.photoURL}
                  className="h-[35px] w-[35px] rounded-full cursor-pointer"
                  alt="User"
                />
              </PopoverTrigger>
              <PopoverContent>
                <h2 className="cursor-pointer" onClick={handleLogout}>
                  Logout
                </h2>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button
            onClick={() => setOpenDialog(true)}
            className="bg-black text-white hover:cursor-pointer"
          >
            Sign In
          </Button>
        )}
      </div>
      <Dialog open={openDialog}>
        <DialogContent setOpenDialog={setOpenDialog} openDialog={openDialog}>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="Logo" />
              <h2 className="font-bold text-lg mt-4">Sign In With Google</h2>
              <p>Sign in securely with Google authentication</p>
              <Button
                onClick={getUserProfile}
                className="w-full text-md mt-2 flex gap-2 items-center cursor-pointer"
              >
                <FcGoogle style={{ width: "1.5rem", height: "1.5rem" }} />
                Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Header;
