import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HotelCardItem({ hotel }) {

    const [photoUrl, setPhotoUrl] = useState();

  const API_KEY = import.meta.env.VITE_GO_MAPS_API_KEY;
  const PHOTO_REF_URL = 'https://maps.gomaps.pro/maps/api/place/photo?photo_reference={NAME}&maxwidth=1000&key='+import.meta.env.VITE_GO_MAPS_API_KEY;

  useEffect(() => {
    if (hotel) getPlaceDetails();
  }, [hotel]);

  const getPlaceDetails = async () => {
    try {
      const BASE_URL = `https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${hotel?.hotelName}&key=${API_KEY}`;
      const response = await axios.get(BASE_URL);
      const placeId = response.data.results[0]?.place_id;
      // console.log(response.data.results[0].photos[0].photo_reference);
      const PhotoUrl = PHOTO_REF_URL.replace('{NAME}',response.data.results[0].photos[0].photo_reference);
      // console.log(PhotoUrl);
      setPhotoUrl(PhotoUrl);
     
    } catch (error) {
      // console.error("Error fetching place details:", error);
    }
  };


  return (
    <Link
      to={
        "https://www.google.com/maps/search/?api=1&query=" +
        hotel?.hotelName +
        hotel?.hotelAddress
      }
      target="_blank"
    >
      <div className="hover:scale-105 transition-all cursor-pointer">
        <img src={photoUrl ? photoUrl : "/logoImage.png"} className="rounded-xl h-[180px] w-full object-cover" alt="" />
        {/* <img src={"/logoImage.png"} className="rounded-xl h-[180px] w-full object-cover" alt="" /> */}
        <div className="my-2 flex flex-col gap-1">
          <h2 className="font-medium">{hotel?.hotelName}</h2>
          <h2 className="text-xs text-gray-500">📍 {hotel?.hotelAddress}</h2>
          <h2 className="text-sm">💰 {hotel?.price}</h2>
          <h2 className="text-sm">⭐ {hotel?.rating} stars</h2>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;
