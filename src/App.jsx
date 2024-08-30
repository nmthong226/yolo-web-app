import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Pusher from "pusher-js";
import Login from "../src/components/Login";
import NavBar from "../src/components/NavBar";
import Users from "../src/components/User";
import Messages from "../src/components/Messages/Messages";
import MessageInput from "../src/components/MessageInput";
import axios from "axios";
import Register from "../src/components/Register";
import HomePage from "../src/components/HomePage";

const App = () => {
  const [loadingModel, setLoadingModel] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedUserUsername, setLoggedUserUsername] = useState(null);
  const [currentChatChannel, setCurrentChatChannel] = useState(null);
  const [pusher, setPusher] = useState(null);
  const [token, setToken] = useState("");
  const handleAuthenticated = async (loginStatus, userData) => {
    setLoggedUserId(userData.id);
    setLoggedUserUsername(userData.username);
    setAuthenticated(loginStatus);
    setToken(userData.token);
    const newPusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: {
          Authorization: "Bearer " + userData.token,
        },
      },
    });
    setPusher(newPusher);
    const response = await axios.get("/api/users", {
      headers: { Authorization: "Bearer " + userData.token },
    });
    setUsers(response.data.filter((user) => user.userName !== userData.username));
    const notifications = newPusher.subscribe(
      `private-notification_user_${userData.id}`
    );
    notifications.bind("new_chat", (data) => {
      const isSubscribed = newPusher.channel(data.channel_name);
      if (!isSubscribed) {
        const oneOnOneChat = newPusher.subscribe(data.channel_name);
        setMessages((prevMessages) => ({
          ...prevMessages,
          [data.channel_name]: [],
        }));
        oneOnOneChat.bind("new_message", (data) => {
          if (data.channel !== currentChatChannel && data.from_user !== loggedUserId) {
            const index = users.findIndex((user) => user.id === data.from_user);
            setUsers((prevUsers) =>
              prevUsers.map((user, i) =>
                i === index ? { ...user, has_new_message: true } : user
              )
            );
          }
          setMessages((prevMessages) => ({
            ...prevMessages,
            [data.channel]: [
              ...(prevMessages[data.channel] || []),
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
    });
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/" />
            ) : (
              <Login onAuthenticated={handleAuthenticated} />
            )
          }
        />
        <Route
          path="/register"
          element={authenticated ? (
            <Navigate to="/" />
          ) : (
              <Register />
            )
          }
        />
        <Route
          path="/"
          element={
            authenticated ? (
              <HomePage
                loggedUserUsername={loggedUserUsername}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;