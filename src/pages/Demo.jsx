import React, { useState, useRef } from 'react'
import { FaVideo } from "react-icons/fa6";
import { FaRegFileImage } from "react-icons/fa";
import { FaPhotoVideo } from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import axios from 'axios';

const Demo = () => {
  const [fileName, setFileName] = useState('No file(s) selected');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const triggerImageUpload = () => {
    imageInputRef.current.click();
  };

  const triggerVideoUpload = () => {
    videoInputRef.current.click();
  };

  const sendFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    axios.post(`${import.meta.env.VITE_API_BASE}/api/demo`, formData)
      .then((response) => {
        // Handle success - log the backend response or do something with it
        console.log("Response from backend:", response.data);
        setResult(response.data[1]);
      })
      .catch((error) => {
        // Handle error - log the error or show an error message to the user
        console.error("Error uploading file:", error.response ? error.response.data : error.message);
      });
    console.log("Sending file:", file);
  };

  return (
    <div className='flex flex-col h-[85vh] w-full items-center'>
      {/* <UploadSection /> */}
      <div className='flex w-full h-full'>
        <div className={`w-1/2 h-full border-2 m-4 rounded-xl flex justify-center ${file ? 'bg-zinc-800 items-stretch' : 'items-center'}`}>
          {file && file.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(file)}
              alt='Selected'
              className='max-w-full max-h-full object-cover rounded-xl'
            />
          )}
          {file && file.type.startsWith('video/') && (
            <video controls className='max-w-full max-h-full object-contain'>
              <source src={URL.createObjectURL(file)} type={file.type} />
              Your browser does not support the video tag.
            </video>
          )}
          {
            !file &&
            <div className='flex flex-col items-center w-64 border-2 rounded-3xl'>
              <FaPhotoVideo className='size-40 fill-zinc-400' />
              <div className='text-zinc-600 text-2xl font-extrabold'>No file selected</div>
            </div>
          }
        </div>
        <div className={`w-1/2 h-full border-2 m-4 rounded-xl flex justify-center ${result ? 'bg-zinc-800 items-stretch' : 'items-center'}`}>
          {
            !result &&
            <div className='flex flex-col items-center w-64 border-2 rounded-3xl'>
              <FaRobot className='size-40 fill-zinc-400' />
              <div className='text-zinc-600 text-2xl font-extrabold'>No results</div>
            </div>
          }
          {result && file && result.includes('.jpg') && (
            <img
              src={result}
              alt='Selected'
              className='max-w-full max-h-full object-cover rounded-xl'
            />
          )}
          {result && file && result.includes('.mp4') && (
            <video controls className='max-w-full max-h-full object-contain'>
              <source src={result} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
      <div className='flex relative items-center'>
        <input
          className='w-[800px] mt-8 p-4 rounded-3xl bg-gray-100 border-2 shadow-inner focus:outline-none'
          placeholder={fileName}
          readOnly />
        <button
          onClick={triggerVideoUpload}
          className='mt-8 absolute right-0 mr-48 bg-gray-200 rounded-full p-2 hover:bg-gray-300'>
          <FaVideo className='' />
        </button>
        <button
          onClick={triggerImageUpload}
          className='mt-8 absolute right-0 mr-36 bg-gray-200 rounded-full p-2 hover:bg-gray-300'>
          <FaRegFileImage className='' />
        </button>
        <button
          onClick={() => sendFile(file)}
          className={`flex space-x-2 mt-8 absolute right-0 mr-4 px-4 py-1 rounded-lg ${file ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-200 cursor-default"} `}>
          <FaEye className={`size-6  ${file ? 'fill-white' : 'fill-gray-400'}`} />
          <span className={`${file ? 'text-white' : 'text-gray-400'}`} >Detect</span>
        </button>
        {/* Hidden file input for images */}
        <input
          type='file'
          ref={imageInputRef}
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {/* Hidden file input for videos */}
        <input
          type='file'
          ref={videoInputRef}
          accept='video/*'
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  )
}

export default Demo