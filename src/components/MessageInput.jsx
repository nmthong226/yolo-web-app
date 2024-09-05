import React, { useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import { FaRegFileImage } from "react-icons/fa";
import ModalImage from "react-modal-image";
import { MdCancel } from "react-icons/md";

const MessageInput = ({ onSendMessage, onSendFile }) => {
  const [messageInput, setMessageInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const sendMessage = () => {
    if (messageInput !== "" || uploadedFile) {
      if (uploadedFile) {
        onSendFile(uploadedFile);
        setUploadedFile(null);
        document.getElementById("fileUpload").value = null;
      }
      if (messageInput !== "") {
        onSendMessage(messageInput);
        setMessageInput("");
      }
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      console.log(file);
    }
  };
  const triggerFileInput = () => {
    document.getElementById('fileUpload').click();
  };
  return (
    <div className="flex w-full justify-center absolute bottom-0">
      <div className="flex flex-col w-full h-full justify-center items-center mb-[2%]">
        <div className="flex flex-col w-[80%] lg:w-[60%]">
          <div className="flex flex-row w-full relative items-center mb-[2%] bg-white border rounded-[32px]">
            <div className="flex flex-col w-full">
              {uploadedFile && (
                <div className="w-[85%] p-4 pb-0 rounded-[32px] focus:outline-none focus:ring-0 resize-none overflow-y-hidden">
                  <div className="flex flex-row">
                    <ModalImage
                      small={URL.createObjectURL(uploadedFile)}
                      medium={URL.createObjectURL(uploadedFile)}
                      className="w-14 h-14 rounded-md object-cover border-2 relative"
                      hideDownload={true}
                      hideZoom={true}
                    />
                    <button
                      className="absolute"
                      onClick={() => setUploadedFile(null)}
                    >
                      <MdCancel className="text-gray-700 size-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-row relative">
                <textarea
                  rows="1"
                  className="w-[85%] p-4 rounded-[32px] focus:outline-none focus:ring-0 resize-none overflow-y-hidden"
                  placeholder="Enter your message"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <div className="absolute right-0 bottom-0 flex flex-row mr-[2%] mb-[6px]">
                  <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    className="p-3 hover:bg-gray-200 rounded-full mr-[8%]"
                    onClick={triggerFileInput}
                  >
                    <FaRegFileImage className="size-5 text-gray-700" />
                  </button>
                  <button
                    className={`p-3 ${messageInput !== "" || uploadedFile !== null ? "hover:bg-zinc-800 bg-zinc-900 cursor-pointer" : "cursor-default"} rounded-full`}
                    onClick={sendMessage}
                  >
                    <LuSendHorizonal className={`size-5 ${messageInput !== "" || uploadedFile !== null ? "text-white" : "text-gray-700"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <span className="text-center text-xsm xsm:text-sm text-gray-600 lg:text-nowrap">
            Canity may provide inaccurate information, so please verify Canity's answers.
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
