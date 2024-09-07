import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import logo from '/public/logo.png';
import { BsFacebook } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const register = async () => {
    setProcessing(true);
    try {
      const response = await axios.post(`${process.env.VITE_API_BASE}/api/register`, {
        username,
        password,
      });
      console.log(response.data.status);
      if (response.data.status === "success") {
        setProcessing(false);
        navigate("/auth/login");
      } else {
        setMessage("Registration failed. Please try again.");
        setProcessing(false);
      }
    } catch (error) {
      setMessage("Registration failed. Please try again.");
      setProcessing(false);
    }
  };
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col w-96 bg-white mx-auto p-5">
        <img src={logo} alt="logo" className="w-[60px] mx-auto mb-2" />
        <span className="text-2xl sm:text-4xl font-bold mx-auto mb-4">Register to Canity</span>
        {processing && <div className="text-center"> Please wait... </div>}
        {message && <div className="text-center bg-red-500 p-2 text-white mb-2 rounded-md"> {message} </div>}
        <input
          type="text"
          className="input-form mb-2 p-2 w-full border border-gray-500 rounded-md"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="input-form p-2 w-full border border-gray-500 rounded-md mb-6"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={register}
          className="btn-block bg-[#484FA2] hover:bg-[#484FA2]/90 text-white text-lg font-semibold p-2 w-full rounded-md"
        >
          Register
        </button>
        <span className="font-bold mx-auto my-4">OR</span>
        <button
          // onClick={register}
          className="relative flex flex-row items-center justify-center bg-[#1777F2] hover:bg-[#1777F2]/90 text-white text-lg font-bold p-6 w-full rounded-md mb-4"
        >
          <BsFacebook className="absolute left-2 text-white size-8 mr-2" />
          <span className="absolute">Continue with Facebook</span>
        </button>
        <button
          // onClick={register}
          className="relative flex flex-row items-center justify-center bg-[#1777F2] hover:bg-[#1777F2]/90 text-white text-lg font-bold p-6 w-full rounded-md mb-2"
        >
          <FcGoogle className="absolute left-2 bg-white size-8 mr-2" />
          <span className="absolute">Continue with Google</span>
        </button>
        <span className="mx-auto text-sm text-center">By continuing you agree to Canity's Terms of Service and Privacy Policy</span>
        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <span className="font-bold text-sm mx-auto hover:text-[#484FA2] hover:cursor-pointer">
          <Link to="/auth/login">Already have an account? Sign in</Link>
        </span>
      </div>
    </div>
  );
};

export default Register;