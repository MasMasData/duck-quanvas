import React from 'react';
import { Handle } from 'reactflow';

const FileUploadNode = ({ data }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      data.onFileUpload(file);
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: 'white' }}>
      <div>{data.label}</div>
      <input type="file" onChange={handleFileChange} accept=".csv" />
      <Handle type="source" position="bottom" id="a" />
    </div>
  );
};

export default FileUploadNode;
