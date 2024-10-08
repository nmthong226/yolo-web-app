import React, { useState, Fragment, useEffect } from 'react';
import NavBar from '../components/NavBar.jsx';
import Bots from '../components/Bots.jsx';
import Messages from '../components/Messages/Messages.jsx';
import MessageInput from '../components/MessageInput.jsx';
import logo from '/public/logo.png';
import { FaPlus } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { getColor, createImageFromInitials } from '../utils/userAvatar.js';
import { GoQuestion } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { RiLogoutBoxRLine } from "react-icons/ri";
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

const HomePage = ({ setAuthenticated, setToken, users, setUsers, loggedUserUsername, loggedUserId, token, pusher, messages, setMessages }) => {
    const [loadingModel, setLoadingModel] = useState(false);
    const [loadingAvatar, setLoadingAvatar] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);
    const [currentChatChannel, setCurrentChatChannel] = useState(null);
    const [AImode, setAIMode] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => {
            setLoadingAvatar(true)
        }, 1000);
    })
    const handleLogout = () => {
        setAuthenticated(false);
        setToken(null);
        localStorage.removeItem("token");
        navigate("/auth/login");
    };
    const getMessage = (channelName) => {
        axios
            .get(`${import.meta.env.VITE_API_BASE}/api/get-message/${channelName}`, {
                headers: { Authorization: "Bearer " + token },
            })
            .then((response) => {
                setMessages((prevMessages) => ({
                    ...prevMessages,
                    [channelName]: response.data,
                }));
            });
    };

    const handleChat = (id) => {
        setActiveChatId(id);
        const activeChatIndex = users.findIndex((user) => user.id === id);
        setUsers((prevUsers) =>
            prevUsers.map((user, i) =>
                i === activeChatIndex ? { ...user, has_new_message: false } : user
            )
        );
        setLoadingModel(true);
        axios
            .post(
                `${import.meta.env.VITE_API_BASE}/api/request-chat`,
                {
                    from_user: loggedUserId,
                    to_user: id,
                },
                { headers: { Authorization: "Bearer " + token } }
            )
            .then((response) => {
                setTimeout(() => {
                    setLoadingModel(false);
                }, 2000);
                const channelName = response.data.channel_name;
                setCurrentChatChannel(channelName);
                getMessage(channelName);
                const isSubscribed = pusher.channel(channelName);
                if (!isSubscribed) {
                    const channel = pusher.subscribe(channelName);
                    setMessages((prevMessages) => ({
                        ...prevMessages,
                        [channelName]: [],
                    }));
                    channel.bind("new_message", (data) => {
                        if (data.channel !== currentChatChannel && data.from_user !== loggedUserId) {
                            setUsers((prevUsers) =>
                                prevUsers.map((user, i) =>
                                    i === activeChatIndex ? { ...user, has_new_message: true } : user
                                )
                            );
                        }
                        setMessages((prevMessages) => ({
                            ...prevMessages,
                            [channelName]: [
                                ...(prevMessages[channelName] || []),
                                {
                                    type: data.type,
                                    message: data.message,
                                    from_user: data.from_user,
                                    to_user: data.to_user,
                                    channel: data.channel,
                                },
                            ],
                        }));
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const sendMessage = (message) => {
        axios.post(
            `${import.meta.env.VITE_API_BASE}/api/send-message`,
            {
                type: "Text",
                from_user: loggedUserId,
                to_user: activeChatId,
                message: message,
                channel: currentChatChannel,
                ai_mode: AImode,
            },
            { headers: { Authorization: "Bearer " + token } }
        );
    };

    const sendFile = (file) => {
        const formData = new FormData();
        formData.append("type", "Image");
        formData.append("from_user", loggedUserId);
        formData.append("to_user", activeChatId);
        formData.append("file", file);
        formData.append("channel", currentChatChannel);
        formData.append("ai_mode", AImode);
        axios.post(`${import.meta.env.VITE_API_BASE}/api/send-file`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + token,
            },
        });
    };
    return (
        <div className="flex flex-row h-screen">
            <div className="flex flex-col justify-between max-lg:hidden lg:w-1/5 h-full">
                <div className='flex flex-row h-[8%] w-full border-2 border-gray-300 items-center justify-between'>
                    <div className='flex flex-row items-center ml-[4%]'>
                        <img src={logo} alt="logo" className="h-10" />
                        <div className="text-zinc-800 font-bold ml-2">Canity Image</div>
                    </div>
                    <button className='mr-[4%]'>
                        <BsReverseLayoutTextSidebarReverse className='size-5' />
                    </button>
                </div>
                <div className='flex-grow flex flex-col border-2 border-t-0 border-gray-300'>
                    <div className='w-full h-full'>
                        <button className='flex flex-row px-4 w-[94%] h-[6%] ml-[3%] bg-[#484FA2] hover:bg-[#484FA2]/90 items-center mt-2 rounded-lg text-white'>
                            <FaPlus className='text-white mr-2' />
                            <span>New chat</span>
                        </button>
                        <div className='flex flex-row px-4 w-[94%] h-[6%] ml-[3%] bg-gray-200 items-center mt-2 rounded-lg text-white'>
                            <CiSearch className='text-gray-600 mr-2' />
                            <input
                                className='bg-gray-200 focus:outline-none focus:ring-0 text-gray-800 h-full w-full'
                                placeholder='Search'>
                            </input>
                        </div>
                        <div className='text-sm text-gray-500 ml-[3%] mt-[4%]'>Categories</div>
                        <Bots users={users} onChat={handleChat} />
                    </div>
                    <div className='ml-[8%] mb-[10%] text-gray-500 space-y-[4%]'>
                        <button className='flex items-center'>
                            <IoSettingsOutline className='mr-2 size-5' />
                            <span>Settings</span>
                        </button>
                        <button className='flex items-center'>
                            <GoQuestion className='mr-2 size-5' />
                            <span>Help</span>
                        </button>
                    </div>
                </div>
                <div className='flex flex-row h-[8%] border-2 border-gray-300 items-center justify-between'>
                    <div className='flex items-center ml-[4%]'>
                        {!loadingAvatar ? (
                            <button className='relative flex rounded-full bg-[#CBCDE5] text-sm focus:ring-2 focus:outline-none focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                                <div className="border-gray-300 h-10 w-10 animate-spin rounded-full border-2 border-t-blue-600" />
                            </button>
                        ) : (
                            <button className='relative flex rounded-full text-sm focus:ring-2 focus:outline-none focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                                <img
                                    id='preview'
                                    src={createImageFromInitials(120, loggedUserUsername, getColor())}
                                    alt='profile-pic'
                                    className='h-10 w-10 rounded-full'
                                />
                            </button>
                        )}

                        <span className='ml-2'>{loggedUserUsername}</span>
                    </div>
                    <button
                        className='mr-[4%]'
                        onClick={() => handleLogout()}
                    >
                        <RiLogoutBoxRLine className='size-5' />
                    </button>
                </div>
            </div>
            {/* <div className="flex flex-col justify-between max-lg:hidden lg:w-[5%] h-full">
                <div className='flex flex-row h-[8%] w-full border-2 border-gray-300 items-center justify-center'>
                    <button className='mr-[4%]'>
                        <BsReverseLayoutTextSidebarReverse className='size-5' />
                    </button>
                </div>
                <div className='flex-grow flex flex-col border-2 border-t-0 border-gray-300 justify-center items-center'>
                    <div className='w-full h-full'>
                        <button className='flex flex-row px-4 w-[94%] h-[6%] ml-[3%] bg-[#484FA2] hover:bg-[#484FA2]/90 items-center mt-2 rounded-lg text-white justify-center'>
                            <FaPlus className='text-white' />
                        </button>
                        <div className='flex flex-row px-4 w-[94%] h-[6%] ml-[3%] bg-gray-200 items-center mt-2 rounded-lg text-white justify-center'>
                            <CiSearch className='text-gray-600' />
                            <input
                                className='hidden bg-gray-200 focus:outline-none focus:ring-0 text-gray-800 h-full w-full'
                                placeholder='Search'>
                            </input>
                        </div>
                    </div>
                    <div className='mb-[10%] text-gray-500 space-y-[4%]'>
                        <button className='flex items-center'>
                            <IoSettingsOutline className='size-5' />
                        </button>
                        <button className='flex items-center'>
                            <GoQuestion className='size-5' />
                        </button>
                    </div>
                </div>
                <div className='flex flex-row h-[8%] border-2 border-gray-300 items-center justify-center'>
                    <div className='flex items-center ml-[4%]'>
                        <button className='relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:outline-none focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                            <img
                                id='preview'
                                src={createImageFromInitials(120, loggedUserUsername, getColor())}
                                alt='profile-pic'
                                className='h-10 w-10 rounded-full'
                            />
                        </button>
                    </div>
                </div>
                {/* <Users users={users} onChat={handleChat} /> */}
            {/* </div> */}
            <div className="flex flex-col w-full lg:w-4/5 h-full relative bg-gray-100">
                <NavBar AImode={AImode} setAIMode={setAIMode} />
                <div className="bg-gray-100 h-[74%]">
                    {loadingModel ? (
                        <div aria-label="Loading..." role="status" className="flex items-center justify-center space-x-2 w-full h-full">
                            <svg className="h-4 w-4 animate-spin stroke-gray-500" viewBox="0 0 256 256">
                                <line x1="128" y1="32" x2="128" y2="64" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="24"></line>
                                <line x1="224" y1="128" x2="192" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                                </line>
                                <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="24"></line>
                                <line x1="128" y1="224" x2="128" y2="192" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                                </line>
                                <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="24"></line>
                                <line x1="32" y1="128" x2="64" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                                </line>
                            </svg>
                            <span className="text-base font-medium text-gray-500">Loading...</span>
                        </div>
                    ) : !currentChatChannel ? (
                        <div className='flex flex-col items-center w-full h-full'>
                            <div className="flex flex-col items-center mt-[2%] w-full">
                                <span className='text-xl xsm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9372ff] via-[#484fa2] to-[#4f14ff]'>Welcome {loggedUserUsername}</span>
                                <span className='text-lg xsm:text-xl md:text-2xl font-bold text-gray-400'>How can I help you?</span>
                            </div>
                            <div className='flex flex-col xsm:flex-wrap lg:flex-nowrap xsm:flex-row max-xsm:w-full max-lg:w-[60%] mt-[2%] lg:h-[40%] items-center justify-center gap-4'>
                                <div className='flex flex-row xsm:flex-col bg-white rounded-2xl border-2 p-[2%] w-[80%] xsm:w-[45%] lg:w-[25%] h-[60%] max-xsm:space-x-2 space-y-0 xsm:space-y-[5%] hover:border-gray-400 hover:cursor-pointer max-xsm:items-center'>
                                    <img src="https://img.icons8.com/ios/50/settings--v1.png" alt="settings--v1" className='w-[25px] h-[25px]'/>
                                    <span className='text-xsm xsm:text-sm text-gray-600'>Demo for YOLO application</span>
                                </div>
                                <div className='flex flex-row xsm:flex-col bg-white rounded-2xl border-2 p-[2%] w-[80%] xsm:w-[45%] lg:w-[25%] h-[60%] max-xsm:space-x-2 space-y-0 xsm:space-y-[5%] hover:border-gray-400 hover:cursor-pointer max-xsm:items-center'>
                                    <img width="25" height="25" src="https://img.icons8.com/ios/50/dog--v1.png" alt="dog--v1" style={{filter: "invert(16%) sepia(81%) saturate(6089%) hue-rotate(257deg) brightness(92%) contrast(121%)"}}/>
                                    <span className='text-xsm xsm:text-sm text-gray-600'>Detect the dog through this image</span>
                                </div>
                                <div className='flex flex-row xsm:flex-col bg-white rounded-2xl border-2 p-[2%] w-[80%] xsm:w-[45%] lg:w-[25%] h-[60%] max-xsm:space-x-2 space-y-0 xsm:space-y-[5%] hover:border-gray-400 hover:cursor-pointer max-xsm:items-center'>
                                    <img width="25" height="25" src="https://img.icons8.com/ios/50/meal.png" alt="meal" style={{filter: "invert(54%) sepia(78%) saturate(952%) hue-rotate(348deg) brightness(92%) contrast(87%)"}}/>
                                    <span className='text-xsm xsm:text-sm text-gray-600'>Find this food name</span>
                                </div>
                                <div className='flex flex-row xsm:flex-col bg-white rounded-2xl border-2 p-[2%] w-[80%] xsm:w-[45%] lg:w-[25%] h-[60%] max-xsm:space-x-2 space-y-0 xsm:space-y-[5%] hover:border-gray-400 hover:cursor-pointer max-xsm:items-center'>
                                    <img width="25" height="25" src="https://img.icons8.com/ios/50/natural-food.png" alt="natural-food" style={{filter: "invert(78%) sepia(8%) saturate(3000%) hue-rotate(43deg) brightness(93%) contrast(80%)"}}/>
                                    <span className='text-xsm xsm:text-sm text-gray-600'>Tell me what is this plant's name?</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Messages
                            activeChat={activeChatId}
                            messages={messages[currentChatChannel] || []}
                            loggedUserName={loggedUserUsername}
                        />
                    )}
                </div>
                <MessageInput onSendMessage={sendMessage} onSendFile={sendFile} />
            </div>
        </div>
    );
};

export default HomePage;