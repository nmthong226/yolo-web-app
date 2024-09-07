import React from 'react'
import { FcFile } from "react-icons/fc";
import { FcFlashOn } from "react-icons/fc";
import { Link } from 'react-router-dom';
import logo from '/public/logo.png';
import { CiSearch } from "react-icons/ci";

const Header = () => {
  return (
    <header>
      <nav className='flex w-full p-3 border-b-[1px] justify-between ml-auto space-x-[1%] items-center'>
        <div className='flex flex-row space-x-4'>
          <div className='flex flex-row items-center'>
            <img src={logo} alt='logo-app' className='w-[30px]' />
            <span className='text-lg font-extrabold ml-2'>Canity Image</span>
          </div>
          <div className='flex relative items-center'>
            <CiSearch className='absolute ml-2 text-gray-600' />
            <input className='w-80 border-2 shadow-inner rounded-xl px-2 pl-8 py-1 text-md focus:outline-gray-400' placeholder='Search' />
          </div>
        </div>
        <div className='flex flex-row space-x-4'>
          <Link
            to='/docs'
            className='flex flex-row text-md items-center space-x-1'>
            <FcFile />
            <span className='hover:text-[#90CAF9]'>
              Docs
            </span>
          </Link>
          <Link
            to='/demo'
            className='flex flex-row text-md items-center'>
            <FcFlashOn />
            <span className='hover:text-[#FFC107]'>Demo</span>
          </Link>
          <Link
            to='/auth/login'
            className='text-md px-2 py-1 border-2 border-zinc-800 bg-zinc-800 text-white rounded-xl hover:bg-white hover:text-zinc-800'>
            Get App
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header