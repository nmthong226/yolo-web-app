import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import logo from '/public/logo.png';
import { BsFacebook } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";

const Login = ({ onAuthenticated }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState("");

    const login = async () => {
        setProcessing(true);
        try {
            const response = await axios.post("/api/login", {
                username,
                password,
            });

            if (response.data.status === "success") {
                setProcessing(false);
                onAuthenticated(true, response.data.data);
            } else {
                setMessage("Login Failed, try again");
                setProcessing(false);
            }
        } catch (error) {
            setMessage("Login Failed, try again");
            setProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full justify-center items-center">
            <div className="flex flex-col w-96 bg-white mx-auto p-5">
                <img src={logo} alt="logo" className="w-[60px] mx-auto mb-2" />
                <span className="text-2xl sm:text-4xl font-bold mb-4">Welcome to Canity</span>
                {processing && <div className="text-center"> Please wait... </div>}
                {message && <div className="text-center"> {message} </div>}
                <input
                    type="text"
                    className="input-form mb-2 p-2 w-full border border-gray-500 rounded-md"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="input-form mb-2 p-2 w-full border border-gray-500 rounded-md"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <p className="font-bold text-sm text-gray-500 mb-6">Forgot your password?</p>
                <button
                    onClick={login}
                    className="btn-block bg-[#484FA2] hover:bg-[#484FA2]/90 text-white text-lg font-semibold p-2 w-full rounded-md"
                >
                    Log in
                </button>
                <span className="font-bold mx-auto my-4">OR</span>
                <button
                    // onClick={login}
                    className="relative flex flex-row items-center justify-center bg-[#1777F2] hover:bg-[#1777F2]/90 text-white text-lg font-bold p-6 w-full rounded-md mb-4"
                >
                    <BsFacebook className="absolute left-2 text-white size-8 mr-2" />
                    <span className="absolute">Continue with Facebook</span>
                </button>
                <button
                    // onClick={login}
                    className="relative flex flex-row items-center justify-center bg-[#1777F2] hover:bg-[#1777F2]/90 text-white text-lg font-bold p-6 w-full rounded-md mb-2"
                >
                    <FcGoogle className="absolute left-2 bg-white size-8 mr-2" />
                    <span className="absolute">Continue with Google</span>
                </button>
                <span className="mx-auto text-sm text-center">By continuing you agree to Canity's Terms of Service and Privacy Policy</span>
                <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                <span className="font-bold text-sm mx-auto hover:text-[#484FA2] hover:cursor-pointer">
                    <Link to="/register">Not on Canity yet? Sign up</Link>
                </span>
            </div>
        </div>
    );
};

export default Login;