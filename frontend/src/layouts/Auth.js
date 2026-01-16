/**
 * Auth Layout for Airport Task Planner
 */

import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../views/Login";

/**
 * Auth layout wrapper for authentication routes.
 * @returns {JSX.Element}
 */
const Auth = () => {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default Auth;
