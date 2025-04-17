import { db } from "@/service/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useNavigation } from "react-router-dom";
import UserTripCardItem from "./components/UserTripCardItem";



function MyTrips() {
  const navigation = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true); // NEW
  useEffect(() => {
    getUserTrips();
  }, []);

  //used to get all user trips
  const getUserTrips = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigation("/");
      return;
    }
    const q = query(
      collection(db, "AITrips"),
      where("userEmail", "==", user?.email)
    );
    const querySnapshot = await getDocs(q);
  const trips = [];
  querySnapshot.forEach((doc) => {
    trips.push(doc.data());
  });
  setUserTrips(trips);
  setLoading(false); // NEW
  };

  return (
    <div className=" md:px-32 lg:px-56 xl:px-72 pl-8 mt-5 md:pl-0 md:mt-7">
      <h2 className="font-bold text-2xl md:text-3xl">My Trips</h2>

      <div className="grid grid-cols-2 mt-4 space-y-4 md:grid-cols-3 md:space-y-6">
  {loading ? (
    [1, 2, 3, 4, 5, 6].map((item, index) => (
      <div
        key={index}
        className="w-[150px] h-[150px] md:h-[200px] md:w-[200px] bg-slate-700 animate-pulse rounded-xl"
      ></div>
    ))
  ) : userTrips.length > 0 ? (
    userTrips.map((trip, index) => (
      <UserTripCardItem trip={trip} key={index} />
    ))
  ) : (
    <div className="col-span-full text-center text-lg text-gray-400 mt-6">
      No trips found. Start planning your next adventure! Create Trip
    </div>
  )}
</div>

    </div>
  );
}

export default MyTrips;
