import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function FeatureCard({ feature }) {
  const cardRef = useRef();
  const svgRef = useRef();
  useEffect(() => {
    const ctx = gsap.context(() => {
      const paths = svgRef.current?.querySelectorAll("path");
      const circles = svgRef.current?.querySelectorAll("circle");

      if (paths.length) {
        gsap.fromTo(
          paths,
          {
            opacity: 0.3,
            fill: "transparent",
          },
          {
            opacity: 1,
            fill: "transparent",
            stroke: "#27f09b",
            repeat: -1,
            yoyo: true,
            stagger: {
              each: 0.05,
              repeat: -1,
              yoyo: true,
            },
            ease: "rough({ strength: 1.5, points: 25, template: linear, taper: none })",
            duration: 0.3,
          }
        );
      }

      if (circles.length) {
        gsap.fromTo(
          circles,
          {
            opacity: 0.3,
            fill: "transparent",
          },
          {
            opacity: 1,
            fill: "transparent",
            stroke: "#27f09b",
            repeat: -1,
            yoyo: true,
            stagger: {
              each: 0.1,
              repeat: -1,
              yoyo: true,
            },
            ease: "rough({ strength: 2, points: 15, template: linear, taper: none })",
            duration: 0.25,
          }
        );
      }
    }, svgRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col-reverse md:flex-row justify-center md:max-w-[80%] items-center gap-2 md:gap-0 md:space-y-4 md:space-x-4 py-7 mt-4 p-4.5 md:py-4 md:p-5 md:pl-9 border-none border-gray-300 rounded-xl transition-shadow hover:shadow-lg ${
        feature.isEven
          ? ""
          : "md:flex-row-reverse md:space-x-reverse md:justify-end"
      }`}
    >
      <div className="flex flex-col py-2 pl-7 space-y-2 md:py-0 md:pl-0 md:space-y-6">
        <h2 className="feature-heading text-xl md:text-left md:text-3xl font-bold ">
          {feature.heading}
        </h2>
        <p className="text-md md:text-left leading-snug  md:leading-normal md:text-lg md:max-w-80">
          {feature.about}
        </p>
      </div>
      <div
        className="feature-logo drop-shadow-[0_0_4px_#27f09b] w-[65vw] h-[30vh] md:w-[30vw] md:h-[45vh] flex items-center justify-center"
        ref={svgRef}
      >
        <div className="w-full h-full">{feature.logo}</div>
      </div>
    </div>
  );
}

export default FeatureCard;
