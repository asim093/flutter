import React, { useEffect, useState } from "react";
import MainLayout from "../MainLayout/MainLayout";
import { 
  Users, 
  MapPin, 
  Layers,
  Building,
  TrendingUp, 
  TrendingDown,
  Star,
  Clock
} from 'lucide-react';
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCities: 0,
    totalCategories: 0,
    totalAttractions: 0,
    topCities: [],
    recentReviews: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/user/stats');
        setStats(response.data);
        console.log("Fetched dashboard data:", response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Optional: Set up an interval to refresh data periodically for real-time updates
    const interval = setInterval(fetchDashboardData, 60000); // refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const statistics = [
    { 
      title: "Total Cities", 
      value: loading ? "..." : stats.totalCities, 
      icon: <Building className="w-8 h-8 text-black" />, 
      color: "bg-gradient-to-r from-blue-500 to-blue-600" 
    },
    { 
      title: "Active Users", 
      value: loading ? "..." : stats.totalUsers, 
      icon: <Users className="w-8 h-8 text-black" />, 
      color: "bg-gradient-to-r from-green-500 to-green-600" 
    },
    { 
      title: "Categories", 
      value: loading ? "..." : stats.totalCategories, 
      icon: <Layers className="w-8 h-8 text-black" />, 
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600" 
    },
    { 
      title: "Attractions", 
      value: loading ? "..." : stats.totalAttractions, 
      icon: <MapPin className="w-8 h-8 text-black" />, 
      color: "bg-gradient-to-r from-purple-500 to-purple-600" 
    },
  ];

  // Example data for other sections (you can replace with actual data from API)
  const recentActivities = stats.recentReviews || [
    { user: "James Howard", action: "Added a review for", place: "Downtown Cafe", time: "10 minutes ago" },
    { user: "Sarah Miller", action: "Added a review for", place: "City Museum", time: "2 hours ago" },
    { user: "David Chen", action: "Added a review for", place: "Harbor View Restaurant", time: "4 hours ago" },
  ];

  const popularPlaces = stats.topCities || [
    { name: "New York", categories: 12, attractions: 45 },
    { name: "Paris", categories: 10, attractions: 38 },
    { name: "Tokyo", categories: 8, attractions: 30 },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">
          {error}. Please try refreshing the page.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time Data Overview</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {statistics.map((stat) => (
          <div 
            key={stat.title} 
            className={`p-4 rounded-lg shadow-lg ${stat.color} ${loading ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-100 opacity-80">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-full">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Reviews</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
          </div>
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium text-gray-200">{activity.user}</span>
                        <span className="text-gray-400"> {activity.action} </span>
                        <span className="font-medium text-indigo-400">{activity.place}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">No recent activities</div>
              )}
            </div>
          )}
        </div>

        {/* Popular Cities */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Popular Cities</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
          </div>
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {popularPlaces.length > 0 ? (
                popularPlaces.map((place, index) => (
                  <div key={index} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-200">{place.name}</p>
                        <p className="text-sm text-gray-400">{place.categories} categories</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end">
                          <MapPin className="w-5 h-5 text-purple-500 mr-1" />
                          <span className="font-medium">{place.attractions}</span>
                        </div>
                        <p className="text-sm text-gray-400">attractions</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">No cities data available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Monthly Growth</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">This Month</button>
            <button className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600">Last Month</button>
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New Users</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {loading ? "..." : stats.newUsers || 32}
                </p>
              </div>
              <div className="flex items-center text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+8%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New Attractions</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {loading ? "..." : stats.newAttractions || 18}
                </p>
              </div>
              <div className="flex items-center text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New Cities</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {loading ? "..." : stats.newCities || 5}
                </p>
              </div>
              <div className="flex items-center text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+6%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;