import React, { useState, useEffect } from 'react';
import { User as UserIcon, Edit, Trash2, Search, RefreshCcw } from 'lucide-react';
import MainLayout from '../MainLayout/MainLayout';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const token = useSelector((state) => state?.user?.data?.token);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/getreview');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      console.log('Fetched reviews:', data);
      // Ensure the data is an array
      const reviewsArray = Array.isArray(data) ? data : [];
      setReviews(reviewsArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
      // Set an empty array in case of error to prevent filtering issues
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
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
          const response = await fetch(`http://localhost:5000/api/user/deletereview/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "Review has been deleted successfully.",
              icon: "success",
              confirmButtonText: "OK",
            });
            fetchReviews();
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete review.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } catch (err) {
          console.error("Error deleting review:", err);
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

  // More lenient filtering - handles undefined/null values safely
  const filteredReviews = reviews.filter(review => {
    if (!searchTerm.trim()) return true; // Show all when search is empty
    
    // Safely check properties that might be undefined/null
    const userName = review.user?.name?.toLowerCase() || '';
    const attractionName = review.attraction?.name?.toLowerCase() || '';
    const comment = review.comment?.toLowerCase() || '';
    
    const term = searchTerm.toLowerCase();
    return userName.includes(term) || 
           attractionName.includes(term) || 
           comment.includes(term);
  });

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Review Management</h1>
          <p className="text-gray-400 mt-1">View and manage user reviews</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search reviews..."
              className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
            <button 
              className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              onClick={fetchReviews}
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Review List */}
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
                onClick={fetchReviews}
              >
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No reviews found</p>
              <button 
                className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                onClick={fetchReviews}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Attraction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Comment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {review?.userId?.profileImage ? (
                                <img className="h-10 w-10 rounded-full" src={review.userId.profileImage} alt={review?.userId?.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{review.userId?.name || "Unknown User"}</div>
                              <div className="text-sm text-gray-400">{review.userId?.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-200">{review.AttractionId?.name || "Unknown Attraction"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i}
                                className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-500"}`}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">{review.review}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteReview(review._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                        No reviews found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && !error && filteredReviews.length > 0 && (
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">{1}</span> to <span className="font-medium">{filteredReviews.length}</span> of{' '}
                    <span className="font-medium">{filteredReviews.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                      Previous
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-indigo-600 text-sm font-medium text-white">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Review;