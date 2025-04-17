import { Button } from "@/components/ui/button";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState();

  const API_KEY = import.meta.env.VITE_GO_MAPS_API_KEY;
  const PHOTO_REF_URL =
    "https://maps.gomaps.pro/maps/api/place/photo?photo_reference={NAME}&maxwidth=1000&key=" +
    import.meta.env.VITE_GO_MAPS_API_KEY;

  useEffect(() => {
    if (place) getPlaceDetails();
  }, [place]);

  const getPlaceDetails = async () => {
    try {
      const BASE_URL = `https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${place?.placeName}&key=${API_KEY}`;
      const response = await axios.get(BASE_URL);
      const placeId = response.data.results[0]?.place_id;
      // console.log(response.data.results[0].photos[0].photo_reference);
      const PhotoUrl = PHOTO_REF_URL.replace(
        "{NAME}",
        response.data.results[0].photos[0].photo_reference
      );
      setPhotoUrl(PhotoUrl);
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  return (
    <Link
      to={"https://www.google.com/maps/search/?api=1&query=" + place?.placeName}
      target="_blank"
    >
      <div className="border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 transition-all hover:shadow-md cursor-pointer">
        <img
          src={photoUrl ? photoUrl : "/logoImage.png"}
          className="w-[130px] h-[130px] rounded-xl object-cover"
          alt=""
        />
        {/* <img
          src={"/logoImage.png"}
          className="w-[130px] h-[130px] rounded-xl object-cover"
          alt=""
        /> */}
        <div>
          <h2 className="font-bold text-lg">{place?.placeName}</h2>
          <p className="text-sm text-gray-500">{place?.placeDetails}</p>
          <h2 className="mt-2">🕙 {place?.timeToSpend}</h2>
          {/* <Button size="sm"><FaMapLocationDot /></Button> */}
        </div>
      </div>
    </Link>
  );
}

export default PlaceCardItem;
