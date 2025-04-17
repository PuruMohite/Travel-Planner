import { Button } from "@/components/ui/button";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosSend } from "react-icons/io";

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState();

  const API_KEY = import.meta.env.VITE_GO_MAPS_API_KEY;
  const PHOTO_REF_URL = 'https://maps.gomaps.pro/maps/api/place/photo?photo_reference={NAME}&maxwidth=1000&key='+import.meta.env.VITE_GO_MAPS_API_KEY;

  useEffect(() => {
    if (trip?.userSelection?.location?.description) getPlaceDetails();
  }, [trip]);

  const getPlaceDetails = async () => {
    try {
      const BASE_URL = `https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${trip?.userSelection?.location?.description}&key=${API_KEY}`;
      // console.log(trip?.userSelection?.location?.description);
      const response = await axios.get(BASE_URL);
      const placeId = response.data.results[0]?.place_id;
      // console.log(response.data.results[0].photos[0].photo_reference);
      const PhotoUrl = PHOTO_REF_URL.replace('{NAME}',response.data.results[0].photos[0].photo_reference);
      setPhotoUrl(PhotoUrl);
     
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  
  return (
    <div>
      {/* 🔹 Displays the fetched image dynamically */}
      <img
        src={photoUrl ? photoUrl : "/logoImage.png"}
        className="h-[310px] w-full object-cover rounded-xl"
        alt="Place"
      />
      {/* <img
        src={"/placeholder.jpg"}
        className="h-[310px] w-full object-cover rounded-xl"
        alt="Place"
      /> */}

      <div className="flex justify-between items-center">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">
            {trip?.userSelection?.location?.description}
          </h2>
          <div className="flex gap-5">
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500">
              📅 {trip?.userSelection?.noOfDays} Day
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500">
              💲 {trip?.userSelection?.budget} Budget
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500">
              🥂 No. of Travelers: {trip?.userSelection?.traveler}
            </h2>
          </div>
        </div>
        <Button>
          <IoIosSend />
        </Button>
      </div>
    </div>
  );
}

export default InfoSection;
