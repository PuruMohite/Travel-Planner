import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "./components/ui/button";
import Hero from "./components/custom/Hero";
import Header from "./assets/Header";
import { Outlet } from "react-router-dom";
import Layout from "./assets/Layout";
import gsap from "gsap";

function App() {
  useEffect(() => {
    const cursor = document.querySelector("#cursor");
    if (!cursor) return;
  
    // Initially hide cursor
    cursor.style.opacity = "0";
  
    const moveCursor = (dets) => {
      // Show cursor on first movement
      if (cursor.style.opacity === "0") {
        gsap.to(cursor, {
          opacity: 1,
          duration: 0.3,
          ease: "power1.out",
        });
      }
  
      gsap.to(cursor, {
        x: dets.x + 5,
        y: dets.y + 5,
        duration: 1,
        ease: "back.out",
      });
    };
  
    // Attach the event after a small delay to ensure DOM paint
    const timeout = setTimeout(() => {
      window.addEventListener("mousemove", moveCursor);
    }, 100); // 100ms delay is enough
  
    // Cleanup
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);
  

  return (
    <>
      <div id="cursor"></div>
      <Layout>
      <Outlet />
      </Layout>
    </>
  );
}

export default App;
