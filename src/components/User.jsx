import React, { useState } from "react";

const Users = ({ users, onChat }) => {
  const [activeUser, setActiveUser] = useState(null);
  const handleChat = (id) => {
    setActiveUser(id);
    onChat(id);
  };
  return (
    <div className="mt-0">
      {users.map((user) => (
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
      ))}
    </div>
  );
};

export default Users;