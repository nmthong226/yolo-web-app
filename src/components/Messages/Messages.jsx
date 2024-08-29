import React from "react";
import './Messages.css';

const Messages = ({ messages, activeChat }) => {
  return (
    <div className="messages">
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
                  ? "to-message"
                  : "from-message ml-auto"
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