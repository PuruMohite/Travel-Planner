import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
("use client");
import React, { useCallback, useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { toast } from "sonner";

function MyProfile() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage when the component mounts
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [joinedAtDate, setJoinedAtDate] = useState(
    () => localStorage.getItem("joinedAtDate") || null
  );
  const [formData, setFormData] = useState({});
  const [openDailog, setOpenDailog] = useState(false);

  const { localUser, setLocalUser } = useContext(UserContext);

  //states for images
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || "/profilePlaceholder1.png"
  );
  const [coverImage, setCoverImage] = useState(
    user?.coverImage || "/placeholder.jpg"
  );
  // console.log("The user is: ", user);
  // console.log("The localUser is: ", localUser);

  // Keep `user` state in sync with `localUser`
  // Sync `user`, `profileImage`, and `coverImage` when `localUser` changes
  useEffect(() => {
    if (localUser) {
      setUser(localUser);
      setProfileImage(localUser.profileImage || "/profilePlaceholder1.png");
      setCoverImage(localUser.coverImage || "/placeholder.jpg");
    } else {
      setUser(null);
      setProfileImage("/profilePlaceholder1.png");
      setCoverImage("/placeholder.jpg");
    }
  }, [localUser]);

  // Function to update Firestore user profile
  const updateUserProfile = async (userId, formData) => {
    try {
      if (!userId) {
        console.error("Error: userId is undefined or null.");
        return;
      }

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, formData);

      // Fetch the updated user data after Firestore update
      const updatedUser = await getUserById(userId);
      if (updatedUser) {
        setUser(updatedUser);
        setLocalUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      console.log("User Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // console.log(localUser);
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localUser?.uid && !localUser?.id) {
      console.error("Error: localUser.uid and localUser.id is missing!");
      return;
    }

    await updateUserProfile(localUser.uid || localUser.id, formData);
  };

  // Function to fetch user data from Firestore
  const getUserById = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }, []);

  // Fetch user from Firestore if needed
  useEffect(() => {
    const fetchUser = async () => {
      if (!localUser?.uid) return;

      const userData = await getUserById(localUser.uid);
      if (userData) {
        setUser(userData);
        setLocalUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        getJoinedAtDate(userData);
      }
    };

    fetchUser();
  }, [localUser?.uid, getUserById]);

  const getJoinedAtDate = (user) => {
    const createdAtDate = user?.createdAt?.toDate();
    // console.log(createdAtDate);
    const formattedDate = createdAtDate?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setJoinedAtDate(formattedDate);
    localStorage.setItem("joinedAtDate", formattedDate); // Store it in localStorage
  };

  //uploading the images to cloudinary
  const renameFile = (file) => {
    const extension = file.name.split(".").pop();
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;
  };

  const uploadToCloudinary = async (file) => {
    const renamedFile = new File([file], renameFile(file), { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);
    formData.append("upload_preset", "my_preset"); // Keep using current preset
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      // console.log(data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return null;
    }
  };

  const updateFirestoreImage = async (type, imageUrl) => {
    const userId = user?.uid || localUser?.uid || user?.id || localUser?.id;
    if (!userId) {
      console.error("Error: userId is undefined!");
      return;
    }

    try {
      // console.log(`Updating Firestore: ${type} -> ${imageUrl}`); // Debugging log
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { [type]: imageUrl });

      // Update state & localStorage
      const updatedUser = { ...user, [type]: imageUrl };
      setUser(updatedUser);
      setLocalUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // console.log("Firestore updated successfully!");
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedUrl = await uploadToCloudinary(file);
    if (uploadedUrl) {
      if (type === "profileImage") {
        setProfileImage(uploadedUrl);
      } else {
        setCoverImage(uploadedUrl);
      }
      updateFirestoreImage(type, uploadedUrl);
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="coverUpload" className="cursor-pointer block">
          <img
            src={user?.coverImage || "/bgPlaceholder3.jpg"}
            alt="Cover"
            className="w-full object-cover  h-[300px] md:h-[250px]"
          />
        </label>
        <input
          id="coverUpload"
          type="file"
          accept="image/*"
          onClick={() =>
            toast.success("Please select new Cover Image", { position: "top-center" })
          }
          onChange={(e) => handleFileChange(e, "coverImage")}
          className="hidden"
        />
      </div>
      <div className="flex md:flex-row w-full p-4 gap-2 md:p-0">
        <div className="flex flex-col items-center md:mx-20 md:w-1/3">
          <label htmlFor="imageUpload" className="cursor-pointer">
            <img
              src={user?.profileImage || "/profilePlaceholder1.png"}
              alt=""
              className="object-cover rounded-full h-[135px] w-[135px] md:h-[200px] md:w-[200px] relative md:top-[-50px]"
            />
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onClick={() =>
              toast.success("Please select new Profile Image", { position: "top-center" })
            }
            onChange={(e) => handleFileChange(e, "profileImage")}
            className="hidden"
          />
          <h1 className="md:text-4xl font-bold md:mt-[-35px] md:text-md text-lg">
            {user?.name}
          </h1>
          <p className="md:text-xl font-bold  text-xs md:text-md text-slate-500">
            {user?.email}
          </p>
          <div className="my-4 flex gap-4">
            <div className="flex flex-col items-center gap-0 text-slate-500 md:gap-1 md:flex-row md:items-stretch">
              <span className="font-bold text-black">0</span> following
            </div>
            <div className="flex flex-col items-center gap-0 text-slate-500 md:gap-1 md:flex-row md:items-stretch">
              <span className="font-bold text-black">0</span> followers
            </div>
          </div>
        </div>
        <div className="md:p-9 flex flex-col md:gap-3 items-center md:items-stretch">
          <h1 className="md:text-2xl font-bold md:w-[80%] text-sm p-3 md:p-1">
            {user?.about ||
              `About the user Lorem ipsum dolor sit amet, consectetur adipisicing
            elit. Excepturi hic corrupti amet explicabo suscipit architecto ipsa
            culpa ducimus neque, unde quaerat esse soluta?`}
          </h1>
          <div className="flex flex-col gap-0 md:gap-5">
            <div className="flex gap-1 flex-col text-xs p-1 text-black md:flex-row md:gap-10 md:text-base">
              <p>
                <span className="text-black">
                  <i className="ri-calendar-line"></i> Joined{" "}
                </span>
                {joinedAtDate}
              </p>
              <p>
                <span className="text-black">
                  <i className="ri-calendar-event-fill"></i>D.O.B{" "}
                </span>
                {`${user?.dateOfBirth || "Not Provided"}`}
              </p>
            </div>
            <div className="flex flex-row gap-3 my-3 md:gap-3 md:my-0">
              {/* edit */}
              <Dialog open={openDailog}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="cursor-pointer text-sm p-3 rounded-full md:text-base md:p-4 md:rounded-md"
                    onClick={() => {
                      setOpenDailog(true);
                    }}
                  >
                    <i className="ri-pencil-line text-xl"></i>
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent
                  setOpenDialog={setOpenDailog}
                  openDialog={openDailog}
                  className="sm:max-w-[425px]"
                >
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid md:gap-4 md:py-4">
                    <div className="grid grid-cols-4 items-center md:gap-4">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        defaultValue={user?.name}
                        className="col-span-3"
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-row items-start md:gap-6">
                      <Label htmlFor="message" className="mt-2">
                        About
                      </Label>
                      <Textarea
                        defaultValue={user?.about}
                        className="w-full"
                        placeholder="I am from . . ."
                        id="message"
                        maxLength={90}
                        onChange={(e) =>
                          handleInputChange("about", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-row items-center justify-start">
                      <Label htmlFor="date-of-birth" className="w-1/3">
                        Date of Birth
                      </Label>
                      <div className="">
                        <input
                          id="date-of-birth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          className="border rounded-md"
                        />
                        {/* <p>
                          Selected Date:{" "}
                          {formData.dateOfBirth
                            ? new Date(
                                formData.dateOfBirth + "T00:00:00"
                              ).toDateString()
                            : "None"}
                        </p> */}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={async (e) => {
                        await handleSubmit(e);
                        setOpenDailog(false);
                      }}
                      className="cursor-pointer"
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* share */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="cursor-pointer text-sm p-3 rounded-full md:text-base md:p-4 md:rounded-md"
                  >
                    <i className="ri-share-line text-lg"></i>Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                      Anyone who has this link will be able to view this.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input
                        id="link"
                        defaultValue="https://ui.shadcn.com/docs/installation"
                        readOnly
                      />
                    </div>
                    <Button type="submit" size="sm" className="px-3">
                      <span className="sr-only">Copy</span>
                      <Copy />
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="text-end">
            {/* delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-white bg-red-600 cursor-pointer hover:text-white hover:bg-red-500 px-6.5 rounded-full md:rounded-md md:px-4"
                >
                  <i className="ri-delete-bin-6-line text-lg"></i> Delete
                  Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
