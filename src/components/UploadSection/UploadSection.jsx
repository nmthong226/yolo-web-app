import React, { useState, useRef } from 'react'
import './UploadSection.css'

const UploadSection = () => {
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const selectFiles = () => {
        fileInputRef.current.click();
    }
    const onFileSelect = (event) => {
        const files = event.target.files;
        if (files.length === 0) return;
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.split("/")[0] !== 'image') continue;
            if (!images.some((e) => e.name === files[i].name)) {
                setImages((prevImages) => [
                    ...prevImages,
                    {
                        name: files[i].name,
                        url: URL.createObjectURL(files[i]),
                    }
                ])
            }
        }
    }

    const deleteImage = (index) => {

    }
    return (
        <div className='card'>
            <div className='top'>
                <p>Drag & Drop image uploading</p>
            </div>
            <div className='drag-area'>
                {isDragging ? (
                    <span className='select'>
                        Drop images here
                    </span>
                ) : (
                    <>
                        Drag & Drop images here or {" "}
                        <span className='select' role='button' onClick={selectFiles}>
                            Browse
                        </span>
                    </>
                )}
                <input name='file' type='file' className='file' multiple ref={fileInputRef} onChange={onFileSelect}></input>
            </div>
            <div className='container'>
                {images.map((image) => (
                    <div className='image'>
                        <span className='delete'>&times;</span>
                        <img src={image.url} alt={image.name} />
                    </div>
                ))}

            </div>
            <button type='button'></button>
        </div >
    )
}

export default UploadSection