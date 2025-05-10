import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Edit,
  Trash2,
  Search,
  RefreshCcw,
  Plus,
  X,
  MapPin,
} from "lucide-react";
import MainLayout from "../MainLayout/MainLayout";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const Attractions = () => {
  const [attractions, setAttractions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttractionId, setCurrentAttractionId] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const token = useSelector((state) => state?.user?.data?.token);

  useEffect(() => {
    fetchAttractions();
    fetchCategories();
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

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/user/getattractions");
      if (response.status !== 200) {
        throw new Error("No Attractions Found Please Add Some");
      }
      const data = await response.json();
      console.log(data);
      setAttractions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/GetCategory");
      if (response.status === 200) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/city");
      if (response.status === 200) {
        const data = await response.json();
        setCities(data);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const deleteAttraction = async (id) => {
    // Using SweetAlert for confirmation before deletion
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5000/api/user/attraction/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            Swal.fire({
              title: "Deleted!",
              text: "Attraction has been deleted successfully.",
              icon: "success",
              confirmButtonText: "OK",
            });
            fetchAttractions();
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete attraction.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } catch (err) {
          console.error("Error deleting attraction:", err);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const handleEditClick = (attraction) => {
    setIsEditing(true);
    setCurrentAttractionId(attraction._id);
    setName(attraction.name || "");
    setDescription(attraction.description || "");
    
    // Ensure we're setting the correct category and city IDs
    setCategoryId(attraction.Category?._id || attraction.category || "");
    setCityId(attraction.City?._id || attraction.city || "");
    
    // Convert latitude and longitude to strings to avoid toString errors
    setLatitude(String(attraction.latitude || ""));
    setLongitude(String(attraction.longitude || ""));
    
    setCurrentImage(attraction.image);
    setPopupOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryId("");
    setCityId("");
    setLatitude("");
    setLongitude("");
    setImageFile(null);
    setCurrentImage(null);
    setIsEditing(false);
    setCurrentAttractionId(null);
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
    formData.append("category", categoryId);
    formData.append("city", cityId);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      let url = "http://localhost:5000/api/user/addattractions";
      let method = "POST";

      if (isEditing) {
        url = `http://localhost:5000/api/user/attraction/${currentAttractionId}`;
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
        // Using SweetAlert for success message
        Swal.fire({
          title: isEditing ? "Updated!" : "Added!",
          text: isEditing 
            ? "Attraction has been updated successfully." 
            : "Attraction has been added successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
        handleClosePopup();
        fetchAttractions();
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: data.message || "Operation failed",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "An unexpected error occurred",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const filteredAttractions = attractions.filter((attraction) =>
    attraction.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className={`p-6 overflow-y-auto ${popupOpen ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Attractions Management</h1>
          <p className="text-gray-400 mt-1">
            Manage all attractions, add, edit, or delete them
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search attractions..."
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
              Add Attraction
            </button>
            <button
              className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              onClick={fetchAttractions}
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Attractions Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p className="text-xl">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                onClick={fetchAttractions}
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredAttractions.length > 0 ? (
                    filteredAttractions.map((attraction) => (
                      <tr key={attraction._id}>
                        <td className="px-6 py-4">
                          {attraction.image ? (
                            <img
                              src={attraction.image}
                              alt={attraction.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white">{attraction.name}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {attraction.Category?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {attraction.City?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{attraction.latitude}, {attraction.longitude}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            className="text-indigo-400 hover:text-indigo-300"
                            onClick={() => handleEditClick(attraction)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteAttraction(attraction._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        No attractions found matching your search.
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
          {/* Fixed position dark overlay behind the popup */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClosePopup}></div>
          
          {/* Fixed position popup with a scrollable interior */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-96 lg:w-1/3 bg-gray-800 border rounded-lg shadow-xl p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Attraction" : "Add Attraction"}
              </h2>
              <button onClick={handleClosePopup}>
                <X className="text-gray-300 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Name</label>
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
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">City</label>
                <select
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                  />
                </div>
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
                  required={!isEditing}
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
                {isEditing ? "Update Attraction" : "Add Attraction"}
              </button>
            </form>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default Attractions;