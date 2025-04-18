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
import ProtectedRoute from "./components/custom/ProtectedRoute";
import ScrollToTop from "./components/custom/ScrollToTop";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <>
            <ScrollToTop />
            <Hero />
          </>
        ),
      },
      {
        path: "create-trip",
        element: (
          <>
            <ScrollToTop />
            <CreateTrip />
          </>
        ),
      },
      {
        path: "view-trip/:tripId",
        element: (
          <ProtectedRoute>
            <ScrollToTop />
            <ViewTrip />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-trips",
        element: (
          <ProtectedRoute>
            <ScrollToTop />
            <MyTrips />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-profile/:userId",
        element: (
          <ProtectedRoute>
            <ScrollToTop />
            <MyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "community/:userId",
        element: (
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        ),
      },
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
