import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

function UserTripCardItem({trip}) {
    const [photoUrl, setPhotoUrl] = useState();

  const API_KEY = import.meta.env.VITE_GO_MAPS_API_KEY;
  const PHOTO_REF_URL = 'https://maps.gomaps.pro/maps/api/place/photo?photo_reference={NAME}&maxwidth=1000&key='+import.meta.env.VITE_GO_MAPS_API_KEY;

  useEffect(() => {
    if (trip) getPlaceDetails();
  }, [trip]);

  const getPlaceDetails = async () => {
    try {
      const BASE_URL = `https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${trip?.userSelection?.location?.description}&key=${API_KEY}`;
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
    <Link to={'/view-trip/'+trip?.id}>
    <div className='hover:scale-105 transition-all'>
        {/* <img src={photoUrl?photoUrl:"/placeholder.jpg"} alt="" className="h-[200px] w-[200px]object-cover rounded-xl"/> */}
        <img src={"/placeholder.jpg"} alt="" className="h-[200px] w-[200px]object-cover rounded-xl"/>
        <div>
            <h2 className='font-bold text-lg'>{trip?.userSelection?.location?.description}</h2>
            <h2 className='text-sm text-gray-500'>{trip?.userSelection?.noOfDays} Days trip with {trip?.userSelection?.budget} Budget</h2>
        </div>
    </div>
    </Link>
  )
}

export default UserTripCardItem