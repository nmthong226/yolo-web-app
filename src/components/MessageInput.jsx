import React, { useState } from "react";

const MessageInput = ({ onSendMessage, onSendFile }) => {
  const [messageInput, setMessageInput] = useState("");
  const [file, setFile] = useState(null);

  const sendMessage = () => {
    if (messageInput !== "") {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const sendFile = () => {
    onSendFile(file);
    setFile(null);
    document.getElementById("file").value = null;
  };

  return (
    <div className="message-input absolute bottom-0 w-full">
      <div className="flex flex-row">
        <div className="w-[40%]">
          <input
            type="text"
            className="w-full p-2 border"
            placeholder="Enter your message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
        </div>
        <div className="w-[60%] flex items-center">
          <label className="mr-2">
            File
            <input
              accept="image/jpeg"
              type="file"
              id="file"
              className="ml-2"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={sendFile}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
