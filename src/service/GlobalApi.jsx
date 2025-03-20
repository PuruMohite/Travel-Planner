import axios from "axios";

// const PLACE_ID_URL = `https://maps.gomaps.pro/maps/api/place/findplacefromtext/json?input=<string>&inputtype=<string>&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`
export const getPlaceDetails=(data) => axios.get(BASE_URL,data,config)