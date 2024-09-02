import React from "react";
import './Messages.css';
import ModalImage from "react-modal-image";
import logo from '/public/logo.png';
import { getColor, createImageFromInitials } from '../../utils/userAvatar.js';

const Messages = ({ messages, activeChat, loggedUserName }) => {
  // Ensure activeChat and from_user are strings for consistent comparison
  const normalizedActiveChat = String(activeChat);

  const shouldDisplayLogo = (messages, index) => {
    if (index === 0) return true;
    return String(messages[index].from_user) !== String(messages[index - 1].from_user);
  };

  return (
    <div className="px-[20%] mt-[2%]">
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
              className={`chat-message w-1/2 ${
                String(message.from_user) === normalizedActiveChat
                  ? "bg-white p-2 mr-auto rounded-lg px-4 text-gray-700 mb-[1%]"
                  : "bg-white p-2 ml-auto rounded-lg px-4 text-gray-700 mb-[1%]"
              }`}
            >
              {message.message}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default Messages;