import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import FeatureCard from "./FeatureCard";

function Hero() {
  const features = [
    {
      heading: "Smart Trip Generator",
      about:
        "Tell us your vibe — Zentra crafts a custom itinerary based on your destination, duration, and budget.",
      logoPath: "/smartTripFeature.svg",
      isEven: true,
    },
    {
      heading: "Personalized Itinerary",
      about:
        "Daily schedules with handpicked places, perfect timing, and real-time Google Maps images.",
      logoPath: "/personalizedItinerary.svg",
      isEven: false,
    },
    {
      heading: "Hotel Recommendations",
      about:
        "Stay smart — we suggest top stays with images, pricing, and location, tailored to your trip.",
      logoPath: "/hotelRecommendations.svg",
      isEven: true,
    },
    {
      heading: "Saved Trips Dashboard",
      about:
        "All your adventures in one place — access past and upcoming trips anytime.",
      logoPath: "/savedTripsDashboard.svg",
      isEven: false,
    },
    {
      heading: "Community Sharing",
      about:
        "Post photos and stories from your trips — explore how others travel, get inspired.",
      logoPath: "/communitySharing.svg",
      isEven: true,
    },
  ];

  return (
    <div className="flex flex-col items-center mx-5 gap-6 my-14 md:mx-56 md:gap-9 md:my-8">
      <h1 className="flex flex-col items-center font-extrabold text-4xl md:text-[2.5rem] text-center mt-16">
        <span className="flex items-center text-[#26ef9a] text-[3rem] font-bold ">
          <img
            src="/logoImage3.svg"
            className="h-20 inline m-0 p-0 mr-[-0.4rem]"
            alt=""
          />{" "}
          entra
        </span>
        <span>An Odyssey of Peace and Purpose</span>
      </h1>
      <p className="text-xl my-3 md:my-0 text-gray-500 text-center">
        Skip the stress. Zentra curates your perfect trip in seconds.
      </p>
      <Link to={"/create-trip"}>
        <Button className="bg-black text-white hover:cursor-pointer">
          Get Started, It's Free
        </Button>
      </Link>

      <div className="flex flex-col items-center mt-40">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-12 text-center md:text-left">
          Designed to Make Travel Effortless
        </h2>
        <div>
          {features.map((feature, index)=> {
            return (
              <FeatureCard key={index} feature={feature}/>
            )
          })

          }
          
        </div>
      </div>
    </div>
  );
}

export default Hero;
