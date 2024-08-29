import React, { useState } from 'react';
import NavBar from './NavBar';
import Users from './User';
import Messages from './Messages/Messages';
import MessageInput from './MessageInput';

const HomePage = ({ loggedUserUsername }) => {
    const [loadingModel, setLoadingModel] = useState(false);
    const [messages, setMessages] = useState({});
    const [users, setUsers] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [currentChatChannel, setCurrentChatChannel] = useState(null);
    const [pusher, setPusher] = useState(null);
    const [token, setToken] = useState("");

    // Your existing methods like handleChat, getMessage, etc.
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
        <div className="container mx-auto">
            <NavBar loggedUser={loggedUserUsername} />
            <div className="flex main-area">
                <div className="w-1/4 p-0 users">
                    <Users users={users} onChat={handleChat} />
                </div>
                <div className="w-3/4 p-0 messages-area">
                    <div className="messages-main overflow-y-scroll h-[90%]">
                        {loadingModel ? (
                            <div className="select-chat text-center">Loading model...</div>
                        ) : !currentChatChannel ? (
                            <div className="select-chat text-center">
                                Select your favorite bot!
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
        </div>
    );
};

export default HomePage;