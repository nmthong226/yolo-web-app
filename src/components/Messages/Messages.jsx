import React from "react";
import './Messages.css';

const Messages = ({ messages, activeChat }) => {
  return (
    <div className="px-[20%] mt-[2%]">
      {messages.map((message, id) => (
        <div key={id}>
          {message.type === "Image" ? (
            <img
              src={message.message}
              className={`chat-message w-1/2 ${message.from_user === activeChat
                  ? "to-message"
                  : "from-message ml-auto"
                }`}
              alt="chat"
            />
          ) : message.type === "Text" ? (
            <div
              className={`chat-message w-1/2 ${message.from_user === activeChat
                  ? "bg-white text-black p-2"
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