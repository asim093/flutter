import React from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Navbar from "../../Components/Navbar/Navbar";
import { useSelector } from "react-redux";

const MainLayout = ({ children }) => {
  const darkmode = useSelector((state) => state.user.darkmode);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div
        className={`flex-1 ml-0 md:ml-64 transition-all duration-300 ease-in-out ${
          darkmode ? "!bg-amber-100 !text-black" : "!bg-gray-900 text-gray-100"
        }`}
      >
        <Navbar />
        <main className="p-6 mt-16">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
