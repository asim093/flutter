import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const Unauthorized = () => {
 

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-black-500 to-gray-600 text-white text-center px-4">
      <h1 className="text-5xl font-bold mb-4">401 - Unauthorized</h1>
      <p className="text-lg max-w-xl">
        Sorry, you don't have permission to access this page. Please contact the admin or try logging in with the correct account.
      </p>
    </div>
  );
};

export default Unauthorized;
