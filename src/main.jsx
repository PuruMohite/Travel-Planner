import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CreateTrip from "./pages/create-trip";
import ViewTrip from "./pages/view-trip/[tripId]";
import MyTrips from "./pages/my-trips";
import MyProfile from "./pages/my-profile/[userId]";
import { UserProvider } from "./context/UserContext.jsx";
import Community from "./pages/community/[userId]";
import Hero from "./components/custom/Hero";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {path: "/", element: <Hero />},
      { path: "create-trip", element: <CreateTrip /> },
      { path: "view-trip/:tripId", element: <ViewTrip /> },
      { path: "my-trips", element: <MyTrips /> },
      { path: "my-profile/:userId", element: <MyProfile /> },
      { path: "community/:userId", element: <Community /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <UserProvider>
        <RouterProvider router={router} />
        <Toaster />
      </UserProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
