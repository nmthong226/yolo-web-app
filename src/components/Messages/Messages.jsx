import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import './Messages.css';
import ModalImage from "react-modal-image";
import logo from '/public/logo.png';
import { getColor, createImageFromInitials } from '../../utils/userAvatar.js';

const Messages = ({ messages, activeChat, loggedUserName }) => {
  // Ensure activeChat and from_user are strings for consistent comparison
  const normalizedActiveChat = String(activeChat);

  // Reference to the container that holds the messages
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Function to scroll to the bottom immediately
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const shouldDisplayLogo = (messages, index) => {
    if (index === 0) return true;
    return String(messages[index].from_user) !== String(messages[index - 1].from_user);
  };

  return (
    <div ref={containerRef} className="px-[20%] mt-[2%] overflow-auto h-full">
      {messages.map((message, id) => (
        <div key={id} className="mb-2">
          {shouldDisplayLogo(messages, id) && (
            <div className="flex items-center mb-1">
              {String(message.from_user) === normalizedActiveChat ? (
                <div className="flex mr-auto mb-[1%] items-center">
                  <img
                    src={logo}
                    alt="User Logo"
                    className="w-8 h-8 rounded-full mr-auto mb-[1%]"
                  />
                  <span className="ml-2 font-bold">Canity</span>
                </div>
              ) : (
                <div className="flex ml-auto mb-[1%] items-center">
                  <img
                    id="preview"
                    src={createImageFromInitials(120, loggedUserName, getColor())}
                    alt="profile-pic"
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="ml-2 font-bold">{loggedUserName}</span>
                </div>
              )}
            </div>
          )}
          {message.type === "Image" ? (
            <ModalImage
              small={message.message}
              medium={message.message}
              className={`chat-message w-1/2 ${
                String(message.from_user) === normalizedActiveChat
                  ? "to-message mr-auto rounded-lg mb-[1%]"
                  : "from-message ml-auto rounded-lg mb-[1%]"
              }`}
              hideDownload={true}
              hideZoom={true}
              alt={`${
                String(message.from_user) !== normalizedActiveChat ? "Input Image" : "Output Image"
              }`}
            />
          ) : message.type === "Text" ? (
            <div
              className={`markdown-container ${
                String(message.from_user) === normalizedActiveChat
                  ? "max-w-full w-fit bg-white p-2 mr-auto rounded-lg px-4 text-gray-700 mb-[1%]"
                  : "max-w-[50%] w-fit bg-white p-2 ml-auto rounded-lg px-4 text-gray-700 mb-[1%]"
              }`}
            >
              <ReactMarkdown>{message.message}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;