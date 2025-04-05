import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

import React from 'react'

function ProtectedRoute({children}) {
    const {localUser} = useContext(UserContext);
    //If user not logged in, redirect to homepage (or login)
    if(!localUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute