import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Edit,
  Trash2,
  Search,
  RefreshCcw,
  Plus,
  X,
} from "lucide-react";
import MainLayout from "../MainLayout/MainLayout";
import { useSelector } from "react-redux";

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCityId, setCurrentCityId] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const token = useSelector((state) => state?.user?.data?.token);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (popupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [popupOpen]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/user/city");
      if (response.status !== 200) {
        throw new Error("Failed to fetch cities");
      }
      const data = await response.json();
      setCities(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCity = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/city/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        fetchCities();
      } else {
        console.error("Failed to delete city");
      }
    } catch (err) {
      console.error("Error deleting city:", err);
    }
  };

  const handleEditClick = (city) => {
    setIsEditing(true);
    setCurrentCityId(city._id);
    setName(city.name);
    setDescription(city.description);
    setCurrentImage(city.image);
    setPopupOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setCurrentImage(null);
    setIsEditing(false);
    setCurrentCityId(null);
  };

  const handleClosePopup = () => {
    resetForm();
    setPopupOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      let url = "http://localhost:5000/api/user/city";
      let method = "POST";

      if (isEditing) {
        url = `http://localhost:5000/api/user/city/${currentCityId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        handleClosePopup();
        fetchCities();
      } else {
        const data = await response.json();
        alert(data.message || "Operation failed");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const filteredCities = cities.filter((city) =>
    city.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className={`p-6 ${popupOpen ? 'blur-sm' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Cities Management</h1>
          <p className="text-gray-400 mt-1">
            Manage all cities, add, edit, or delete them
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search cities..."
              className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              onClick={() => {
                resetForm();
                setPopupOpen(true);
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add City
            </button>
            <button
              className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              onClick={fetchCities}
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Cities Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p className="text-xl">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                onClick={fetchCities}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      City Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <tr key={city._id}>
                        <td className="px-6 py-4">
                          {city.image ? (
                            <img
                              src={city.image}
                              alt={city.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white">{city.name}</td>
                        <td className="px-6 py-4 text-gray-400">{city.description}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            className="text-indigo-400 hover:text-indigo-300"
                            onClick={() => handleEditClick(city)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteCity(city._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                        No cities found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {popupOpen && (
        <>
          {/* Dark overlay behind the popup */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClosePopup}></div>
          
          {/* Popup */}
          <div className="w-full md:w-96 lg:w-1/3 bg-gray-800 border rounded-lg shadow-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? "Edit City" : "Add City"}
              </h2>
              <button onClick={handleClosePopup}>
                <X className="text-gray-300 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">City Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Image</label>
                {isEditing && currentImage && (
                  <div className="mb-2 flex items-center">
                    <img 
                      src={currentImage} 
                      alt="Current" 
                      className="h-16 w-16 object-cover rounded mr-2" 
                    />
                    <span className="text-sm text-gray-400">Current image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                />
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1">
                    Upload a new image only if you want to change the current one
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                {isEditing ? "Update City" : "Add City"}
              </button>
            </form>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default Cities;