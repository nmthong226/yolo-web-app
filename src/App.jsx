import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Pusher from "pusher-js";
import Login from "./pages/Login";
import axios from "axios";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import { jwtDecode } from "jwt-decode";
import Document from "./pages/Document/Document";
import Demo from "./pages/Demo";
import Layout from "./components/Layout";

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
    localStorage.setItem("token", userData.token);
    const newPusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: `${import.meta.env.VITE_API_BASE}/api/pusher/auth`,
      auth: {
        headers: {
          Authorization: "Bearer " + userData.token,
        },
      },
    });
    setPusher(newPusher);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE}/api/users`, {
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

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const decodedToken = jwtDecode(savedToken);
      if (decodedToken.exp * 1000 < Date.now()) {
        console.log("Token expired, clearing localStorage and logging out");
        localStorage.removeItem("token");
        setAuthenticated(false);
        setToken(null);
        return;
      }
      setToken(savedToken);
      setAuthenticated(true);
      axios.get(`${import.meta.env.VITE_API_BASE}/api/users/me`, {
        headers: { Authorization: "Bearer " + savedToken },
      }).then(response => {
        console.log(response);
        setLoggedUserId(response.data.data.id);
        setLoggedUserUsername(response.data.data.username);
        const newPusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
          cluster: import.meta.env.VITE_PUSHER_CLUSTER,
          authEndpoint: `${import.meta.env.VITE_API_BASE}/api/pusher/auth`,
          auth: {
            headers: {
              Authorization: "Bearer " + savedToken,
            },
          },
        });
        setPusher(newPusher);
      }).catch(error => {
        console.error("Error fetching user data:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("token");
          setAuthenticated(false);
          setToken(null);
        }
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/docs" element={<Document />} />
          <Route path="/demo" element={<Demo />} />
          <Route
            path="/auth/login"
            element={
              authenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onAuthenticated={handleAuthenticated} />
              )
            }
          />
          <Route
            path="/auth/register"
            element={
              authenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Register />
              )
            }
          />
        </Route>
        <Route
          path="/dashboard"
          element={
            authenticated ? (
              <HomePage
                loggedUserUsername={loggedUserUsername}
                loggedUserId={loggedUserId}
                setAuthenticated={setAuthenticated}
                setToken={setToken}
                users={users}
                setUsers={setUsers}
                loadingModel={loadingModel}
                setLoadingModel={setLoadingModel}
                messages={messages}
                setMessages={setMessages}
                pusher={pusher}
                token={token}
              />
            ) : (
              <Navigate to="/auth/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;