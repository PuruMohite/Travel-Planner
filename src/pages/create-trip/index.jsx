import GoMapsAutocomplete from "@/components/custom/GoMapsAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import {
  AI_PROMPT,
  SelectTravelersList,
  selectBudgetOptions,
} from "@/constants/options";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { chatSession } from "@/service/AIModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

function CreateTrip() {
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState([]);
  const [openDailog, setOpenDailog] = useState(false);
  const { localUser, setLocalUser } = useContext(UserContext);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // useEffect(() => {
  //   console.log(formData);
  // }, [formData]);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => getUserProfile(codeResp),
    onError: (error) => console.log(error),
  });

  const onGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      //save the formData temporarily before showing the sign-in
      localStorage.setItem("pendingTripFormData", JSON.stringify(formData));
      setOpenDailog(true);
      return;
    }
    if (
      formData?.noOfDays > 5 ||
      !formData?.location ||
      !formData?.budget ||
      !formData?.traveler ||
      !formData?.noOfDays
    ) {
      toast("Please fill all details");
      return;
    }
    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT.replace(
      "{location}",
      formData?.location?.description
    )
      .replace("{totalDays}", formData?.noOfDays)
      .replace("{traveler}", formData?.traveler)
      .replace("{budget}", formData?.budget)
      .replace("{totalDays}", formData?.noOfDays);

    const result = await chatSession.sendMessage(FINAL_PROMPT);

    // console.log("--", result?.response?.text());
    setLoading(false);
    saveAiTrip(result?.response?.text());
  };

  const saveAiTrip = async (TripData) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const docId = Date.now().toString();
    await setDoc(doc(db, "AITrips", docId), {
      userSelection: formData,
      tripData: JSON.parse(TripData),
      userEmail: user?.email,
      id: docId,
    });
    setLoading(false);
    navigate("/view-trip/" + docId);
  };

  const getUserByEmail = async (googleUser , email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming email is unique, return the first matching document
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      //User doesn't exist - create new one
      const newDocRef = doc(collection(db, "users"));
      const newUser = {
          id: newDocRef.id,
          name: googleUser.name,
          email: googleUser.email,
          photoURL: googleUser.picture,
          createdAt: new Date(),
          profileImage: "/profilePlaceholder1.png",
      };
      await setDoc(newDocRef, newUser);
      return newUser;
    }
  };

  const getUserProfile = async (tokenInfo) => {
    try {
      const resp = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "Application/json",
          },
        }
      );
      console.log(resp.data);
      const user = await getUserByEmail(resp.data, resp.data.email); // ✅ await it
      localStorage.setItem("user", JSON.stringify(user));
      setLocalUser(user);
      setOpenDailog(false);
  
      const storedFormData = localStorage.getItem("pendingTripFormData");
      if (storedFormData) {
        setFormData(JSON.parse(storedFormData));
        localStorage.removeItem("pendingTripFormData");
  
        // Slight delay to let state update before generating trip
        setTimeout(() => onGenerateTrip(), 100);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };
  return (
    <div className="mt-5 sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 md:mt-7">
      <h2 className="font-bold text-2xl md:text-3xl">
        Tell us your travel preferences 🏕️🌴
      </h2>
      <p className="mt-3 text-gray-500 text-lg md:text-xl">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary based on your preferences.
      </p>
      <div className="mt-3 md:mt-10 flex flex-col gap-2">
        <div>
          <h2 className="text-lg md:text-xl my-3 font-bold">
            What is destination of choice?
          </h2>
          <GoMapsAutocomplete
            onSelect={(v) => {
              setPlace(v);
              handleInputChange("location", v);
            }}
          />
        </div>
        <div>
          <h2 className="text-lg md:text-xl my-3 font-bold">
            How many days are you planning your trip?
          </h2>
          <Input
            placeholder={"Ex.3"}
            type="number"
            onChange={(e) => handleInputChange("noOfDays", e.target.value)}
          />
        </div>
      </div>
      <div>
        <h2 className="text-lg md:text-xl my-5 font-medium">
          What is your Budget?
        </h2>
        <div className="grid grid-cols-3 gap-5">
          {selectBudgetOptions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("budget", item.title)}
              className={`flex flex-col items-center p-2 md:p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                formData.budget == item.title && "shadow-lg border-emerald-500"
              }`}
            >
              <h2 className="text-3xl">{item.icon}</h2>
              <h2 className="font-bold text-base md:text-lg">{item.title}</h2>
              <h2 className="text-sm text-gray-500">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg md:text-xl my-3 font-medium">
          Who do you plan on traveling with on your next adventure?
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-5 my-5">
          {SelectTravelersList.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("traveler", item.people)}
              className={`flex flex-col items-center p-2 md:p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                formData?.traveler == item.people && "shadow-lg border-emerald-500"
              }`}
            >
              <h2 className="text-3xl">{item.icon}</h2>
              <h2 className="font-bold text-base md:text-lg">{item.title}</h2>
              <h2 className="text-sm text-gray-500">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>
      <div className="my-10 flex justify-end">
        <Button
          disabled={loading}
          onClick={onGenerateTrip}
          className="bg-transparent text-[#27f09b] border-2 border-[#27f09b] hover:bg-[#27f09b] hover:text-black transition-colors duration-300 ease-in-out cursor-pointer"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
          ) : (
            "Generate Trip"
          )}
        </Button>
      </div>

      <Dialog open={openDailog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="" />
              <h2 className="font-bold text-lg mt-4">Sign In With Google</h2>
              <p>Sign in to the App with Google authentication securely</p>
              <Button
                onClick={login}
                className="w-full text-md mt-2 flex gap-2 items-center"
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

export default CreateTrip;
