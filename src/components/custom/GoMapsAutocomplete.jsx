import { useState } from "react";
import axios from "axios";

const GoMapsAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${value}&key=${import.meta.env.VITE_GOMAPS_API_KEY}`
        );

        // console.log("API Response:", response.data); // Debugging
        setSuggestions(response.data.predictions || []); // Handle missing `predictions`
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        placeholder="Search for a location..."
      />
      {suggestions.length > 0 && (
        <ul className="absolute w-full bg-white border rounded mt-1 shadow-md">
          {suggestions.map((place) => (
            <li
              key={place.place_id || place.id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                setQuery(place.description);
                setSuggestions([]);
                onSelect(place);
              }}
            >
              {place.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoMapsAutocomplete;
