import React from "react";
import Login from "../Login/Login";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isLogin);
  const Role = useSelector((state) => state.user.data.Role);
  const isAdmin = Role === "Admin";

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-black-500 via-black-500 to-black-500 text-white px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You are not allowed to access this page. Only admin can access this
            section.
          </p>
          <button
            onClick={() => (window.location.href = "/Login")}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
          >
            🔙 Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
