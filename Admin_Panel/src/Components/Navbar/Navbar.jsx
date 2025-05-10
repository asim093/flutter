import React, { useState } from "react";
import { 
  Bell, 
  User, 
  Search, 
  Sun
} from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../Redux/features/User-slice";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useSelector((state) => state.user.data);
  const dispatch = useDispatch();

  return (
    <nav className="fixed top-0 right-0 z-30 w-full md:w-[calc(100%-16rem)] bg-gray-900 border-b border-gray-800 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex-1 md:flex hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 py-2 pl-10 pr-4 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <button 
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="w-6 h-6" />
        </button>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-white" onClick={() => dispatch(toggleDarkMode())}>
            <Sun className="w-6 h-6" />
          </button>
          <button className="text-gray-300 hover:text-white relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
          </button>
          <div className="flex items-center">
            <button className="flex items-center text-gray-300 hover:text-white">
              <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full mx-2" />
              <span className="hidden md:block">Admin</span>
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="md:hidden p-3 bg-gray-800 border-b border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
