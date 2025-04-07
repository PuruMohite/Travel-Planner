import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "./components/ui/button";
import Hero from "./components/custom/Hero";
import Header from "./assets/Header";
import { Outlet } from "react-router-dom";
import Layout from "./assets/Layout";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Layout>
      <Outlet />
      </Layout>
    </>
  );
}

export default App;
