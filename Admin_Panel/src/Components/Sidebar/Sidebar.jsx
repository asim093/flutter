import React, { useState } from "react";
import {
  Home,
  MapPin,
  Users,
  Star,
  Settings,
  BarChart2,
  LogOut,
  Menu,
  X,
  Citrus,
  CircleDotIcon,
  Captions,
  AtSign,
  ParkingMeter,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Category from "../../pages/Category/Category";
import { RemoveData, removeUser } from "../../Redux/features/User-slice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(RemoveData());
    Swal.fire({
      title: "Logout Successful",
      text: "You have been logged out successfully.",
      icon: "success",
    });
    navigate("/Login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <Home className="w-6 h-6" />, path: "/" },
    {
      name: "Cities",
      icon: <CircleDotIcon className="w-6 h-6" />,
      path: "/Cities",
    },
    {
      name: "Category",
      icon: <Captions className="w-6 h-6" />,
      path: "/Category",
    },
    { name: "Users", icon: <Users className="w-6 h-6" />, path: "/users" },
    { name: "Reviews", icon: <Star className="w-6 h-6" />, path: "/reviews" },
    {
      name: "Attractions",
      icon: <ParkingMeter className="w-6 h-6" />,
      path: "/Attractions",
    },
  ];

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-md"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        } bg-gray-900 text-white border-r border-gray-800`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          {!collapsed && (
            <div className="text-xl font-bold text-indigo-500">CityGuide</div>
          )}
          {collapsed && (
            <div className="text-xl font-bold text-indigo-500 mx-auto">CG</div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:block text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors duration-200"
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full px-4 py-4 border-t border-gray-800" onClick={handleLogout}>
          <button className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors duration-200">
            <LogOut className="w-6 h-6 mr-3" />
            {!collapsed && <span >Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
