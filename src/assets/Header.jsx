import React, { useContext, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
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
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

function Header() {
  const { localUser: user, setLocalUser } = useContext(UserContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [profilePic, setProfilePic] = useState(
    user?.profileImage || "/profilePlaceholder1.png"
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [openPopover, setOpenPopover] = useState(false);

  useEffect(() => {
    // Load cached user from localStorage on mount
    const cachedUser = JSON.parse(localStorage.getItem("user"));
    if (cachedUser?.profileImage) {
      setProfilePic(cachedUser.profileImage);
    }

    const fetchUser = async () => {
      if (user) {
        const userRef = doc(db, "users", user?.id || user?.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;

        if (userData && JSON.stringify(userData) !== JSON.stringify(user)) {
          setLocalUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Cache the latest user
          setProfilePic(userData.profileImage); // ✅ Update profilePic once data is available
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [user?.id, user?.uid]);

  // Update only when the user state changes
  useEffect(() => {
    if (user?.profileImage) {
      setProfilePic(user.profileImage);
    }
  }, [user?.profileImage]);

  // Handle Google Sign-In
  const getUserProfile = async () => {
    setIsLoading(true);
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
          id: googleUser.uid,
          profileImage: "/profilePlaceholder1.png",
        });
      }

      // Store user info locally
      const userData = { uid: googleUser.uid, ...googleUser };
      localStorage.setItem("user", JSON.stringify(userData));
      setLocalUser(userData);
      setProfilePic(userData.profileImage);
      setOpenDialog(false);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
    setIsLoading(false);
  };

  // Logout Function
  const handleLogout = () => {
    setIsLoading(true);
    googleLogout();
    localStorage.removeItem("user");
    setLocalUser(null);
    setIsLoading(false);
  };

  const pageNavigate = (pageName) => {
    if (pageName === "community") {
      navigate("/community/" + user?.id);
    } else if (pageName === "create-trip") {
      navigate("/create-trip");
    } else if (pageName === "my-trips") {
      navigate("/my-trips");
    } else if (pageName === "my-profile") {
      navigate("/my-profile/" + user?.id);
    }else if(pageName === "home"){
      navigate("/");
    }
  };
  // console.log(user);

  return (
    <div className="h-15 md:h-20 shadow-sm flex flex-row justify-between items-center px-3 fixed top-0 left-0 w-full z-50 bg-white  md:px-12">
      <img src="/logoImage3.svg" className="cursor-pointer h-14 w-auto object-contain" alt="Logo"  onClick={() => {pageNavigate("home")}}/>
      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className={`w-9 h-9 md:w-auto md:h-10 rounded-full cursor-pointer ${
                location.pathname.includes("community")
                  ? "bg-[#27f09b] text-black hover:bg-[#27f09b]"
                  : ""
              }`}
              onClick={() => {
                pageNavigate("community");
              }}
            >
              <i className="ri-group-fill text-xl"></i>
              <span className="hidden md:block">Community</span>
            </Button>

            <Button
              variant="default"
              className={`w-9 h-9 md:w-auto md:h-10 rounded-full cursor-pointer ${
                location.pathname.includes("create-trip")
                  ? "bg-[#27f09b] text-black hover:bg-[#27f09b]"
                  : ""
              }`}
              onClick={() => {
                pageNavigate("create-trip");
              }}
            >
              <i className="ri-add-circle-line text-2xl"></i>
              <span className="hidden md:block">Create Trip</span>
            </Button>

            <Button
              variant="default"
              className={`w-9 h-9 md:w-auto md:h-10 rounded-full cursor-pointer ${
                location.pathname.includes("my-trips")
                  ? "bg-[#27f09b] text-black hover:bg-[#27f09b]"
                  : ""
              }`}
              onClick={() => {
                pageNavigate("my-trips");
              }}
            >
              <i className="ri-landscape-line text-2xl"></i>
              <span className="hidden md:block">My Trips</span>
            </Button>
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger>
                <img
                  src={profilePic}
                  className="h-[35px] w-[35px] rounded-full cursor-pointer"
                  alt="User"
                  onClick={() => setOpenPopover(true)}
                />
              </PopoverTrigger>
              <PopoverContent className="p-2 flex flex-col w-[100%] ">
                <div className="hover:bg-gray-100 p-2 rounded-md">
                  <h2
                    className="cursor-pointer font-bold"
                    onClick={() => {
                      pageNavigate("my-profile");
                      setOpenPopover(false);
                    }}
                  >
                    <i className="ri-user-3-fill"></i> My Profile
                  </h2>
                </div>
                <div className="hover:bg-gray-100 p-2 rounded-md">
                  <h2
                    className="cursor-pointer font-bold"
                    onClick={() => {
                      handleLogout();
                      setOpenPopover(false);
                    }}
                  >
                    <i className="ri-logout-box-r-line text-red-500"></i> Logout
                  </h2>
                </div>
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent openDialog={openDialog} setOpenDialog={setOpenDialog}>
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
