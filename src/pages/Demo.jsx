import React from 'react'
import UploadSection from '../components/UploadSection/UploadSection'

const Demo = () => {
  return (
    <div className='flex flex-col w-full h-[85vh] justify-between items-center'>
      <UploadSection />
      <div className='flex'>
        <input className='w-[800px] p-4 rounded-3xl bg-gray-100' placeholder='No file(s) selected'/>
      </div>
    </div>
  )
}

export default Demo