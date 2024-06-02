import React, { useState } from 'react';
import Swal from 'sweetalert2';

const FileUpload = ({ onFileUpload }) => {
 const [fileContent, setFileContent] = useState(null);

 const handleFileChange = (event) => {
   const file = event.target.files[0];
   if (file) {
     const reader = new FileReader();
     reader.onload = (e) => {
       setFileContent(e.target.result);
     };
     reader.readAsText(file);
   }
 };

 const handleUpload = () => {
   if (fileContent) {
     Swal.fire({
       title: "Are you sure?",
       text: "You won't be able to revert this!",
       icon: "warning",
       showCancelButton: true,
       confirmButtonColor: "#3085d6",
       cancelButtonColor: "#d33",
       confirmButtonText: "Yes, upload",
       cancelButtonText: "Cancel"
     }).then((result) => {
       if (result.isConfirmed) {
         onFileUpload(fileContent);
         Swal.fire({
           title: "Uploaded!",
           text: "Your file has been uploaded.",
           icon: "success"
         });
       }
     });
   }
 };

 return (
   <div className="mb-4">
     <input
       type="file"
       accept=".csv"
       onChange={handleFileChange}
       className="py-2 px-4 border rounded"
     />
     <button
       onClick={handleUpload}
       className="ml-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
     >
       Upload now
     </button>
   </div>
 );
};

export default FileUpload;