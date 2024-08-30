import React, { useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import { FaRegFileImage } from "react-icons/fa";

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
    <div className="flex w-full h-[18%] bg-gray-100 justify-center">
      <div className="flex flex-col w-full h-full justify-center items-center">
        <div className="flex flex-col w-[60%]">
          <div className="flex flex-row w-full relative items-center mb-[2%]">
            <div className="flex flex-row w-full">
              <textarea
                rows="1"
                className="w-full p-4 border rounded-[32px] focus:outline-none focus:ring-0 resize-none overflow-y-hidden"
                placeholder="Enter your message"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
            </div>
            <div className="absolute right-0 flex flex-row mr-[2%]">
              <button
                className="p-3 hover:bg-gray-200 rounded-3xl mr-[8%]"
                onClick={sendMessage}
              >
                <FaRegFileImage className="size-5 text-gray-700" />
              </button>
              <button
                className="p-3 hover:bg-gray-200 rounded-3xl"
                onClick={sendMessage}
              >
                <LuSendHorizonal className="size-5 text-gray-700" />
              </button>
            </div>
          </div>
          <span className="text-center text-sm text-gray-600">Canity may provide inaccurate information, so please verify Canity's answers. Your Privacy and Canity's Apps</span>
        </div>
        {/* <div className="w-[60%] flex items-center">
          <input
            accept="image/jpeg"
            type="file"
            id="file"
            className="ml-2"
            onChange={handleFileUpload}
          />
        </div> */}
      </div>
    </div>
  );
};

export default MessageInput;
