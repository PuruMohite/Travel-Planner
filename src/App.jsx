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

    const moveCursor = (dets) => {
      gsap.to(cursor, {
        x: dets.x,
        y: dets.y,
        duration: 1,
        ease: "back.out",
      });
    };

    if (cursor) {
      window.addEventListener("mousemove", moveCursor);
    }

    // Cleanup on unmount
    return () => {
      if (cursor) {
        window.removeEventListener("mousemove", moveCursor);
      }
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
