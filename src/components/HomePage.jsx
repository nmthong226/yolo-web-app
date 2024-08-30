import React, { useState, Fragment } from 'react';
import NavBar from './NavBar';
import Users from './User';
import Messages from './Messages/Messages';
import MessageInput from './MessageInput';
import logo from '/public/logo.png';
import { FaPlus } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { getColor, createImageFromInitials } from '../utils/userAvatar.js';
import { GoQuestion } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";

const HomePage = ({ loggedUserUsername }) => {
    const [loadingModel, setLoadingModel] = useState(false);
    const [messages, setMessages] = useState({});
    const [users, setUsers] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [currentChatChannel, setCurrentChatChannel] = useState(null);
    const [pusher, setPusher] = useState(null);
    const [token, setToken] = useState("");
    console.log(loggedUserUsername);
    const classNames = (...classes) => {
        return classes.filter(Boolean).join(' ');
    }
    const logout = () => {
        console.log("logout");
    };
    const getMessage = (channelName) => {
        axios
            .get(`/api/get_message/${channelName}`, {
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
                "/api/request_chat",
                {
                    from_user: loggedUserId,
                    to_user: id,
                },
                { headers: { Authorization: "Bearer " + token } }
            )
            .then((response) => {
                setLoadingModel(false);
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
            "/api/send_message",
            {
                type: "Text",
                from_user: loggedUserId,
                to_user: activeChatId,
                message: message,
                channel: currentChatChannel,
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

        axios.post("/api/send_file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + token,
            },
        });
    };
    return (
        <div className="flex flex-row h-screen">
            <div className="flex flex-col justify-between w-1/5 h-full">
                <div className='flex flex-row h-[8%] w-full border-2 border-gray-300 items-center'>
                    <img src={logo} alt="logo" className="h-10 ml-4" />
                    <div className="text-zinc-800 font-bold ml-2">Canity Image</div>
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
                <div className='flex flex-row h-[8%] border-2 border-gray-300 items-center'>
                    <div className='flex items-center ml-[4%]'>
                        <button className='relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:outline-none focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                            <img
                                id='preview'
                                src={createImageFromInitials(120, loggedUserUsername, getColor())}
                                alt='profile-pic'
                                className='h-10 w-10 rounded-full'
                            />
                        </button>
                        <span className='ml-2'>{loggedUserUsername}</span>
                    </div>
                </div>
                {/* <Users users={users} onChat={handleChat} /> */}
            </div>
            <div className="flex flex-col w-4/5 h-full">
                <NavBar />
                <div className="bg-gray-100 h-[74%]">
                    {loadingModel ? (
                        <div className="select-chat text-center">Loading model...</div>
                    ) : !currentChatChannel ? (
                        <div className="flex flex-col items-center mt-[2%] w-full h-full">
                            <span className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9372ff] via-[#484fa2] to-[#4f14ff]'>Welcome {loggedUserUsername}</span>
                            <span className='text-2xl font-bold text-gray-400'>How can I help you?</span>
                        </div>
                    ) : (
                        <Messages
                            activeChat={activeChatId}
                            messages={messages[currentChatChannel] || []}
                        />
                    )}
                </div>
                <MessageInput onSendMessage={sendMessage} onSendFile={sendFile} />
            </div>
        </div>
    );
};

export default HomePage;