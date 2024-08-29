import React from "react";

const NavBar = ({ loggedUser }) => {
  return (
    <nav className="bg-[#3498db] p-4 flex items-center justify-between">
      <div className="text-white font-bold">Narupedia</div>
      <div className="text-white">Welcome {loggedUser}!</div>
    </nav>
  );
};

export default NavBar;