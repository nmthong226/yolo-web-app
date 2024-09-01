import React, { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegCircleCheck } from "react-icons/fa6";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { GrSun } from "react-icons/gr";
import { FiMoon } from "react-icons/fi";

const NavBar = ({ users, onChat }) => {
  const [activeUser, setActiveUser] = useState(1);
  useEffect(() => {
    setActiveUser(users[0]?.id || 1);
  }, [])
  const handleChat = (id) => {
    setActiveUser(id);
    onChat(id);
  };
  return (
    <nav className="flex h-[8%] items-center justify-between border-2 border-l-0 border-gray-300 px-4 bg-white">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="flex text-zinc-800 font-bold text-[calc(14px+(26-20)*((100vw-300px)/(1600-300)))] items-center hover:bg-gray-200 hover:cursor-pointer p-2 rounded-md">
            Canity
            <IoIosArrowDown className="ml-[6%]" />
          </MenuButton>
        </div>
        <MenuItems
          transition
          className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            <MenuItem>
              <button
                type="submit"
                className="flex justify-between items-center w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                onClick={() => handleChat(1)}
              >
                Canity Basic
                <FaRegCircleCheck className={`${activeUser === 1 ? "" : "hidden"}`} />
              </button>
            </MenuItem>
            <MenuItem>
              <button
                type="submit"
                className="flex justify-between items-center w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                onClick={() => handleChat(2)}
              >
                <span className="flex">Canity<p className="text-transparent bg-clip-text bg-gradient-to-r from-[#9372ff] via-[#484fa2] to-[#9372ff] ml-[2%]">Advanced</p></span>
                <FaRegCircleCheck className={`${activeUser === 2 ? "" : "hidden"}`} />
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
      <button className="flex text-zinc-800 font-bold items-center bg-gray-200 hover:cursor-pointer p-2 rounded-md">
        <div className="bg-white p-1 rounded-md">
          <GrSun className="size-5" />
        </div>
        <div className="ml-2 p-1 hover:bg-white rounded-md">
          <FiMoon className="size-5" />
        </div>
      </button>
    </nav>
  );
};

export default NavBar;