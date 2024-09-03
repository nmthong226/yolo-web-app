import React, { useState } from "react";

const Bots = ({ users, onChat }) => {
  const [activeUser, setActiveUser] = useState(null);
  const handleChat = (id) => {
    setActiveUser(id);
    onChat(id);
  };
  return (
    <div className="mt-0">
      {/* {users.map((user) => (
        <div
          key={user.id}
          className={`user ${activeUser === user.id ? "active" : ""}`}
          onClick={() => handleChat(user.id)}
        >
          {user.userName}
          {user.has_new_message && (
            <span className="has_new_message">New message</span>
          )}
        </div>
      ))} */}
      <button 
        className={`flex flex-row px-2 w-[94%] h-[6%] ml-[3%] bg-none border-2 ${activeUser === 1 && "bg-gray-100"} hover:bg-gray-100 items-center mt-2 rounded-lg text-white`}
        onClick={() => handleChat(1)}
      >
        <img width="28" height="28" src="https://img.icons8.com/fluency/48/settings.png" alt="doge" className='mr-2' />
        <span className='text-gray-600 text-sm'>Demo App</span>
      </button>
      <button 
        className={`flex flex-row px-2 w-[94%] h-[6%] ml-[3%] bg-none border-2 ${activeUser === 2 && "bg-gray-100"} hover:bg-gray-100 items-center mt-2 rounded-lg text-white`}
        onClick={() => handleChat(2)}
      >
        <img width="28" height="28" src="https://img.icons8.com/fluency/48/year-of-dog.png" alt="doge" className='mr-2' />
        <span className='text-gray-600 text-sm'>Dog Detect v1.0</span>
      </button>
      <button 
        className={`flex flex-row px-2 w-[94%] h-[6%] ml-[3%] bg-none border-2 ${activeUser === 3 && "bg-gray-100"} hover:bg-gray-100 items-center mt-2 rounded-lg text-white`}
        onClick={() => handleChat(3)}
      >
        <img width="28" height="28" src="https://img.icons8.com/fluency/48/hamburger.png" alt="doge" className='mr-2' />
        <span className='text-gray-600 text-sm'>Food Detect v1.0</span>
      </button>
      <button 
        className={`flex flex-row px-2 w-[94%] h-[6%] ml-[3%] bg-none border-2 ${activeUser === 4 && "bg-gray-100"} hover:bg-gray-100 items-center mt-2 rounded-lg text-white`}
        onClick={() => handleChat(4)}
      >
        <img width="28" height="28" src="https://img.icons8.com/color/48/potted-plant--v1.png" alt="doge" className='mr-2' />
        <span className='text-gray-600 text-sm'>Plant Detect v1.0</span>
      </button>
    </div>
  );
};

export default Bots;