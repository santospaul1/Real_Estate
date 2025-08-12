// src/components/PhotoUploader.js
import React, { useState } from 'react';
import API from '../api';

export default function PhotoUploader({ propertyId, onUploaded }){
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);

  const handleFiles = e => {
    const arr = Array.from(e.target.files || []);
    setFiles(arr);
    setCaptions(arr.map(()=> ''));
  };

  const handleCaption = (i,v) => { const copy=[...captions]; copy[i]=v; setCaptions(copy); };

  const submit = async () => {
    if (!files.length) return alert('Choose images');
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    captions.forEach(c => fd.append('captions', c));
    try {
      await API.post(`properties/${propertyId}/upload_photos/`, fd, { headers: {'Content-Type':'multipart/form-data'} });
      setFiles([]); setCaptions([]);
      onUploaded && onUploaded();
    } catch (err) {
      console.error(err); alert('Upload failed');
    }
  };

  return (
    <div className="uploader">
      <input type="file" multiple accept="image/*" onChange={handleFiles} />
      <div className="preview-row">
        {files.map((f,i)=> (
          <div key={i} className="preview-item">
            <img src={URL.createObjectURL(f)} alt="" />
            <input value={captions[i]||''} onChange={e=>handleCaption(i, e.target.value)} placeholder="Caption" />
          </div>
        ))}
      </div>
      <button onClick={submit}>Upload Photos</button>
    </div>
  );
}
