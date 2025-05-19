import { useState } from "react";
import axios from "axios";
import { useRef } from "react";
const GoMapsAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [apiFailed, setApiFailed] = useState(false);
  const inputRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${value}&key=${import.meta.env.VITE_GO_MAPS_API_KEY}`
        );

        const preds = response.data.predictions || [];
        setSuggestions(preds);
        setApiFailed(false);
        setShowDropdown(true); // show suggestions
      } catch (error) {
        console.error("GoMaps API failed:", error.message);
        setApiFailed(true);
        setSuggestions([]);
        setShowDropdown(true); // still show the fallback option
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };
  const handleManualSelect = () => {
    if (query.trim() !== "") {
      onSelect({ description: query, manual: true });
      setSuggestions([]);
      setShowDropdown(false); // explicitly hide
      inputRef.current?.blur();
    }
  };
  
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length === 0) {
      handleManualSelect();
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border rounded"
        placeholder="Search for a location..."
      />

{(suggestions.length > 0 || (query.trim() && apiFailed)) && showDropdown && (
  <ul className="absolute w-full max-h-60 overflow-y-auto bg-black border rounded mt-1 shadow-md z-50">
    {suggestions.map((place) => (
      <li
        key={place.place_id || place.id}
        className="p-2 cursor-pointer hover:bg-gray-900"
        onClick={() => {
          setQuery(place.description);
  setSuggestions([]);
  setShowDropdown(false); // hide dropdown
  onSelect(place);
  inputRef.current?.blur();
        }}
      >
        {place.description}
      </li>
    ))}

    {suggestions.length === 0 && query.trim() && (
      <li
        className="p-2 cursor-pointer text-gray-300 hover:bg-gray-900"
        onClick={handleManualSelect}
      >
        Use "{query}"
      </li>
    )}
  </ul>
)}

    </div>
  );
};

export default GoMapsAutocomplete;
